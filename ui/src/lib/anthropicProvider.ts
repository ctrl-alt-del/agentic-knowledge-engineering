import type { LlmProvider } from './llmProvider'
import type { Message } from './types'
import type { LlmConfig } from './config'

export class AnthropicProvider implements LlmProvider {
  private apiKey: string
  private baseURL: string
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(config: LlmConfig) {
    this.apiKey = config.apiKey
    this.baseURL = config.baseURL.replace(/\/$/, '')
    this.model = config.model
    this.temperature = config.options.temperature
    this.maxTokens = config.options.maxTokens
  }

  async sendMessage(messages: Message[]): Promise<string> {
    const system = this.extractSystem(messages)
    const chatMessages = this.toAnthropicMessages(messages)
    const body = this.buildBody(chatMessages, system, false)

    const response = await this.fetchApi(body)

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText)
      throw new Error(`Anthropic API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || ''
  }

  async sendMessageStream(messages: Message[], onChunk: (chunk: string) => void): Promise<void> {
    const system = this.extractSystem(messages)
    const chatMessages = this.toAnthropicMessages(messages)
    const body = this.buildBody(chatMessages, system, true)

    const response = await this.fetchApiStream(body)

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText)
      throw new Error(`Anthropic API error ${response.status}: ${err}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith('event: ')) {
          currentEvent = trimmed.slice(7)
          continue
        }

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6)

          if (currentEvent === 'content_block_delta') {
            try {
              const parsed = JSON.parse(data)
              if (parsed.delta?.type === 'text_delta' && parsed.delta.text) {
                onChunk(parsed.delta.text)
              }
            } catch {
              // skip
            }
          }

          currentEvent = ''
        }
      }
    }
  }

  private extractSystem(messages: Message[]): string {
    return messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n')
  }

  private toAnthropicMessages(messages: Message[]): { role: string; content: string }[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }))
  }

  private buildBody(
    messages: { role: string; content: string }[],
    system: string,
    stream: boolean,
  ) {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      max_tokens: this.maxTokens,
    }

    if (system) body.system = system
    if (stream) body.stream = true
    if (this.temperature !== undefined) body.temperature = this.temperature

    return body
  }

  private fetchApi(body: Record<string, unknown>): Promise<Response> {
    return fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })
  }

  private fetchApiStream(body: Record<string, unknown>): Promise<Response> {
    return fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
    })
  }
}
