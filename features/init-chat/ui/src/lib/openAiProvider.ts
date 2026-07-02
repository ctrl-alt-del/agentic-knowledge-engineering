import type { LlmProvider } from './llmProvider'
import type { Message } from './types'
import type { LlmConfig } from './config'

export class OpenAiProvider implements LlmProvider {
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
    const body = this.buildBody(messages, false)
    const response = await this.fetchApi(body)

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText)
      throw new Error(`OpenAI API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  async sendMessageStream(messages: Message[], onChunk: (chunk: string) => void): Promise<void> {
    const body = this.buildBody(messages, true)
    const response = await this.fetchApi(body)

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText)
      throw new Error(`OpenAI API error ${response.status}: ${err}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      const text = await response.text()
      onChunk(text)
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) onChunk(content)
        } catch {
          // skip unparseable lines
        }
      }
    }
  }

  private buildBody(messages: Message[], stream: boolean) {
    return {
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'system' : m.role,
        content: m.content,
      })),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream,
    }
  }

  private fetchApi(body: Record<string, unknown>): Promise<Response> {
    return fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })
  }
}
