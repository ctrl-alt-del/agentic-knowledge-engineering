import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatInput from './ChatInput.vue'

describe('ChatInput', () => {
  it('emits submit when Enter is pressed with text', async () => {
    const wrapper = mount(ChatInput)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('hello')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0]).toEqual(['hello'])
  })

  it('emits submit when send button is clicked', async () => {
    const wrapper = mount(ChatInput)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('hello')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('submit')![0]).toEqual(['hello'])
  })

  it('does not emit submit with Shift+Enter', async () => {
    const wrapper = mount(ChatInput)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('hello')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('does not emit submit on empty input', async () => {
    const wrapper = mount(ChatInput)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('does not emit submit on whitespace-only input', async () => {
    const wrapper = mount(ChatInput)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('   ')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('clears input after submit', async () => {
    const wrapper = mount(ChatInput)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('hello')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })
    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('disables send button when input is empty', async () => {
    const wrapper = mount(ChatInput)
    const button = wrapper.find('button')
    expect(button.element.disabled).toBe(true)
  })

  it('enables send button when input has text', async () => {
    const wrapper = mount(ChatInput)
    await wrapper.find('textarea').setValue('hi')
    const button = wrapper.find('button')
    expect(button.element.disabled).toBe(false)
  })
})
