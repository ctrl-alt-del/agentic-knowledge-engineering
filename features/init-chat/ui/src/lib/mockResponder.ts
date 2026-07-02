import type { LlmProvider } from './llmProvider'
import type { Message } from './types'

const RESPONSES = [
  "That's an interesting question! Let me think about it...",
  'I would approach this by breaking it down into smaller steps.',
  'Good point! Here is what I think: the key is to start with a solid foundation.',
  'Based on what you described, I would recommend trying a different angle.',
  'Thanks for sharing that. Let me offer a different perspective.',
  'That is a common challenge. The typical solution involves careful planning.',
  'I see what you mean. Have you considered looking at this from the user perspective?',
  'Great question! Here are a few things to keep in mind...',
  'From my understanding, the best practice would be to start small and iterate.',
  'Interesting! Let me share some thoughts on how to tackle this.',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDelay(): number {
  return 300 + Math.random() * 1200
}

export class MockResponder implements LlmProvider {
  async sendMessage(_messages: Message[]): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))
    return randomItem(RESPONSES)
  }
}
