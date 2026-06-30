export interface LlmProvider {
  sendMessage(content: string): Promise<string>
}
