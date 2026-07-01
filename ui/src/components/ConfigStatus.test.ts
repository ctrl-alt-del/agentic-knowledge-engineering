import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfigStatus from './ConfigStatus.vue'

describe('ConfigStatus', () => {
  it('shows connected status with provider and model', () => {
    const wrapper = mount(ConfigStatus, {
      props: { status: 'connected', providerName: 'OpenAI', modelName: 'gpt-4o', show: true },
    })
    expect(wrapper.text()).toContain('OpenAI')
    expect(wrapper.text()).toContain('gpt-4o')
    expect(wrapper.find('.bg-green-500').exists()).toBe(true)
  })

  it('shows mock status', () => {
    const wrapper = mount(ConfigStatus, {
      props: { status: 'mock', providerName: '', modelName: '', show: true },
    })
    expect(wrapper.text()).toContain('Mock')
    expect(wrapper.find('.bg-yellow-400').exists()).toBe(true)
  })

  it('shows error status', () => {
    const wrapper = mount(ConfigStatus, {
      props: { status: 'error', providerName: 'OpenAI', modelName: 'gpt-4o', show: true },
    })
    expect(wrapper.find('.bg-red-500').exists()).toBe(true)
  })

  it('hides when show is false', () => {
    const wrapper = mount(ConfigStatus, {
      props: { status: 'connected', providerName: 'OpenAI', modelName: 'gpt-4o', show: false },
    })
    expect(wrapper.text()).toBe('')
  })
})
