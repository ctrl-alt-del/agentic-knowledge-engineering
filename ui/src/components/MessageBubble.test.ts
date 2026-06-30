import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageBubble from './MessageBubble.vue'

describe('MessageBubble', () => {
  it('renders user message right-aligned with warm background', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'user', content: 'hello' },
    })
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('You')
    expect(wrapper.find('.self-end').exists()).toBe(true)
    expect(wrapper.find('.bg-warm-user').exists()).toBe(true)
  })

  it('renders assistant message left-aligned with cool background', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'assistant', content: 'hi' },
    })
    expect(wrapper.text()).toContain('hi')
    expect(wrapper.text()).toContain('Assistant')
    expect(wrapper.find('.self-start').exists()).toBe(true)
    expect(wrapper.find('.bg-cool-assistant').exists()).toBe(true)
  })

  it('renders long messages without overflow', () => {
    const longText = 'a'.repeat(500)
    const wrapper = mount(MessageBubble, {
      props: { role: 'user', content: longText },
    })
    expect(wrapper.text()).toContain(longText)
    expect(wrapper.find('.break-words').exists()).toBe(true)
  })

  it('escapes HTML content', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'user', content: '<script>alert(1)</script>' },
    })
    expect(wrapper.html()).not.toContain('<script>')
    expect(wrapper.text()).toContain('<script>alert(1)</script>')
  })
})
