import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAiProvider } from './openAiProvider'
import type { LlmConfig } from './config'
import type { Message } from './types'

const testConfig: LlmConfig = {
  provider: 'openai-compatible',
  apiKey: 'sk-test',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o',
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

describe('OpenAiProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('constructs request body with correct format', async () => {
    const provider = new OpenAiProvider(testConfig)
    const fetchSpy = mockFetch(200, { choices: [{ message: { content: 'Hello!' } }] })
    vi.stubGlobal('fetch', fetchSpy)

    const messages: Message[] = [{ id: '0', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' }]
    await provider.sendMessage(messages)

    const call = fetchSpy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(call[1].body as string)
    expect(body.model).toBe('gpt-4o')
    expect(body.messages).toEqual([{ role: 'user', content: 'hi' }])
    expect(body.stream).toBe(false)
    expect(call[0]).toBe('https://api.openai.com/v1/chat/completions')
  })

  it('extracts content from non-streaming response', async () => {
    const provider = new OpenAiProvider(testConfig)
    vi.stubGlobal('fetch', mockFetch(200, { choices: [{ message: { content: 'Hello!' } }] }))

    const response = await provider.sendMessage([{ id: '0', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' }])
    expect(response).toBe('Hello!')
  })

  it('handles API error', async () => {
    const provider = new OpenAiProvider(testConfig)
    vi.stubGlobal('fetch', mockFetch(401, { error: 'Unauthorized' }))

    await expect(provider.sendMessage([{ id: '0', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' }])).rejects.toThrow(
      'OpenAI API error 401',
    )
  })

  it('sends system messages correctly', async () => {
    const provider = new OpenAiProvider(testConfig)
    const fetchSpy = mockFetch(200, { choices: [{ message: { content: 'ok' } }] })
    vi.stubGlobal('fetch', fetchSpy)

    const messages: Message[] = [
      { id: '0', role: 'system', content: 'You are helpful.', timestamp: '2026-07-01 00:00:00' },
      { id: '1', role: 'user', content: 'hi', timestamp: '2026-07-01 00:00:00' },
    ]
    await provider.sendMessage(messages)

    const call = fetchSpy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(call[1].body as string)
    expect(body.messages[0]).toEqual({ role: 'system', content: 'You are helpful.' })
    expect(body.messages[1]).toEqual({ role: 'user', content: 'hi' })
  })

  it('streams chunks via sendMessageStream', async () => {
    const provider = new OpenAiProvider(testConfig)

    const sseChunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n',
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
