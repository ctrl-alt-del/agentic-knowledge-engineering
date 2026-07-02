import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageList from './MessageList.vue'
import type { Message } from '../lib/types'

describe('MessageList', () => {
  const messages: Message[] = [
    { id: '1', role: 'assistant', content: 'Hello!', timestamp: '2026-07-01 17:00:00' },
    { id: '2', role: 'user', content: 'Hi there', timestamp: '2026-07-01 17:00:01' },
  ]

  it('renders all messages', () => {
    const wrapper = mount(MessageList, {
      props: { messages, isTyping: false },
    })
    expect(wrapper.text()).toContain('Hello!')
    expect(wrapper.text()).toContain('Hi there')
  })

  it('shows typing indicator when isTyping is true', () => {
    const wrapper = mount(MessageList, {
      props: { messages, isTyping: true },
    })
    const spans = wrapper.findAll('.w-1\\.5')
    expect(spans.length).toBe(3)
  })

  it('hides typing indicator when isTyping is false', () => {
    const wrapper = mount(MessageList, {
      props: { messages, isTyping: false },
    })
    const spans = wrapper.findAll('.w-1\\.5')
    expect(spans.length).toBe(0)
  })

  it('renders empty list without errors', () => {
    const wrapper = mount(MessageList, {
      props: { messages: [], isTyping: false },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
