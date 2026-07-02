import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageBubble from './MessageBubble.vue'

const ts = '2026-07-01 17:30:45'

describe('MessageBubble', () => {
  it('renders user message right-aligned with warm background', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'user', content: 'hello', timestamp: ts },
    })
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('You')
    expect(wrapper.find('.self-end').exists()).toBe(true)
    expect(wrapper.find('.bg-warm-user').exists()).toBe(true)
  })

  it('renders assistant message left-aligned with cool background', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'assistant', content: 'hi', timestamp: ts },
    })
    expect(wrapper.text()).toContain('hi')
    expect(wrapper.text()).toContain('Assistant')
    expect(wrapper.find('.self-start').exists()).toBe(true)
    expect(wrapper.find('.bg-cool-assistant').exists()).toBe(true)
  })

  it('renders long messages without overflow', () => {
    const longText = 'a'.repeat(500)
    const wrapper = mount(MessageBubble, {
      props: { role: 'user', content: longText, timestamp: ts },
    })
    expect(wrapper.text()).toContain(longText)
    expect(wrapper.find('.break-words').exists()).toBe(true)
  })

  it('renders markdown bold', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'user', content: '**hello**', timestamp: ts },
    })
    expect(wrapper.html()).toContain('<strong>hello</strong>')
  })

  it('displays timestamp', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'user', content: 'hi', timestamp: ts },
    })
    expect(wrapper.text()).toContain('2026-07-01 17:30:45')
  })

  it('has copy button', () => {
    const wrapper = mount(MessageBubble, {
      props: { role: 'assistant', content: 'hello', timestamp: ts },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
