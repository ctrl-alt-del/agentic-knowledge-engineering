import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnthropicProvider } from './anthropicProvider'
import type { LlmConfig } from './config'
import type { Message } from './types'

const testConfig: LlmConfig = {
  provider: 'anthropic',
  apiKey: 'sk-ant-test',
  baseURL: 'https://api.anthropic.com/v1',
  model: 'claude-sonnet-4-20250514',
  options: { temperature: 0.7, maxTokens: 4096, stream: true },
}

function mockFetch(status: number, data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

describe('AnthropicProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('constructs request with correct format', async () => {
    const provider = new AnthropicProvider(testConfig)
    const fetchSpy = mockFetch(200, { content: [{ type: 'text', text: 'Hello!' }] })
    vi.stubGlobal('fetch', fetchSpy)

    const messages: Message[] = [{ id: '0', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' }]
    await provider.sendMessage(messages)

    const call = fetchSpy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(call[1].body as string)
    expect(body.model).toBe('claude-sonnet-4-20250514')
    expect(body.messages).toEqual([{ role: 'user', content: 'hi' }])
    expect(body.stream).toBeUndefined()
    expect(call[0]).toBe('https://api.anthropic.com/v1/messages')
    expect(call[1].headers).toMatchObject({ 'x-api-key': 'sk-ant-test' })
  })

  it('extracts content from response', async () => {
    const provider = new AnthropicProvider(testConfig)
    vi.stubGlobal('fetch', mockFetch(200, { content: [{ type: 'text', text: 'Hello!' }] }))

    const response = await provider.sendMessage([{ id: '0', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' }])
    expect(response).toBe('Hello!')
  })

  it('handles API error', async () => {
    const provider = new AnthropicProvider(testConfig)
    vi.stubGlobal('fetch', mockFetch(500, { error: 'Server error' }))

    await expect(provider.sendMessage([{ id: '0', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' }])).rejects.toThrow(
      'Anthropic API error 500',
    )
  })

  it('extracts system prompt to top-level field', async () => {
    const provider = new AnthropicProvider(testConfig)
    const fetchSpy = mockFetch(200, { content: [{ type: 'text', text: 'ok' }] })
    vi.stubGlobal('fetch', fetchSpy)

    const messages: Message[] = [
      { id: '0', role: 'system', content: 'You are helpful.', timestamp: '2026-07-01 00:00:00' },
      { id: '1', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' },
    ]
    await provider.sendMessage(messages)

    const call = fetchSpy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(call[1].body as string)
    expect(body.system).toBe('You are helpful.')
    expect(body.messages).toEqual([{ role: 'user', content: 'hi' }])
  })

  it('streams chunks via sendMessageStream', async () => {
    const provider = new AnthropicProvider(testConfig)

    const sseChunks = [
      'event: content_block_delta\n',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}\n\n',
      'event: content_block_delta\n',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":" world"}}\n\n',
      'event: message_stop\n',
      'data: {"type":"message_stop"}\n\n',
    ]

    let chunkIndex = 0
    const mockReader = {
      read: () => {
        if (chunkIndex < sseChunks.length) {
          const encoder = new TextEncoder()
          const value = encoder.encode(sseChunks[chunkIndex++])
          return Promise.resolve({ done: false, value })
        }
        return Promise.resolve({ done: true, value: undefined })
      },
    }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({}),
      body: { getReader: () => mockReader },
    }))

    const chunks: string[] = []
    await provider.sendMessageStream(
      [{ id: '0', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' }],
      (chunk) => chunks.push(chunk),
    )

    expect(chunks).toEqual(['Hello', ' world'])
  })
})
