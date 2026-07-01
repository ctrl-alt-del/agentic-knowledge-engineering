import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatContainer from './ChatContainer.vue'
import type { LlmProvider } from '../lib/llmProvider'
import type { Message } from '../lib/types'

function createMockProvider(delay = 0, response = 'Mock response'): LlmProvider {
  return {
    async sendMessage(_messages: Message[]) {
      await new Promise((r) => setTimeout(r, delay))
      return response
    },
  }
}

describe('ChatContainer', () => {
  it('shows welcome message on mount', () => {
    const wrapper = mount(ChatContainer, {
      global: { provide: { llmProvider: createMockProvider() } },
    })
    expect(wrapper.text()).toContain('Hello! How can I help you today?')
  })

  it('adds user message and provider response on submit', async () => {
    const wrapper = mount(ChatContainer, {
      global: { provide: { llmProvider: createMockProvider(0, 'Test reply') } },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('hello')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })

    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 10))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('Test reply')
  })

  it('shows typing indicator while waiting for response', async () => {
    let resolveDelayed!: (value: string) => void
    const delayedProvider: LlmProvider = {
      async sendMessage(_messages: Message[]) {
        return new Promise((resolve) => {
          resolveDelayed = resolve
        })
      },
    }

    const wrapper = mount(ChatContainer, {
      global: { provide: { llmProvider: delayedProvider } },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('ping')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })

    await wrapper.vm.$nextTick()
    const spans = wrapper.findAll('.rounded-full')
    const typingDots = spans.filter(
      (s) => s.classes().includes('w-1.5') && s.classes().includes('h-1.5'),
    )
    expect(typingDots.length).toBeGreaterThan(0)

    resolveDelayed('done')
  })

  it('clears input after submit', async () => {
    const wrapper = mount(ChatContainer, {
      global: { provide: { llmProvider: createMockProvider(0, 'ok') } },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('hello')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })

    await wrapper.vm.$nextTick()
    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('uses sendMessageStream when available', async () => {
    const streamingProvider: LlmProvider = {
      async sendMessage(_messages: Message[]) {
        return 'fallback'
      },
      async sendMessageStream(_messages: Message[], onChunk: (chunk: string) => void) {
        onChunk('Hello')
        onChunk(' world')
        await Promise.resolve()
      },
    }

    const wrapper = mount(ChatContainer, {
      global: { provide: { llmProvider: streamingProvider } },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('ping')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Hello world')
  })

  it('passes full message history to provider', async () => {
    let receivedMessages: Message[] = []
    const trackingProvider: LlmProvider = {
      async sendMessage(msgs: Message[]) {
        receivedMessages = msgs
        return 'ok'
      },
    }

    const wrapper = mount(ChatContainer, {
      global: { provide: { llmProvider: trackingProvider } },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('first')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })
    await new Promise((r) => setTimeout(r, 10))
    await wrapper.vm.$nextTick()

    expect(receivedMessages.length).toBeGreaterThanOrEqual(2)
    expect(receivedMessages.some((m) => m.content === 'first')).toBe(true)
  })
})
