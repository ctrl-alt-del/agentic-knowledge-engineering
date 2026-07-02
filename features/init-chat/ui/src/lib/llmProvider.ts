import type { Message } from './types'

export interface LlmProvider {
  sendMessage(messages: Message[]): Promise<string>
  sendMessageStream?(messages: Message[], onChunk: (chunk: string) => void): Promise<void>
}
