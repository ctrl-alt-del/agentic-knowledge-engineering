<template>
  <div class="h-screen flex flex-col max-w-[480px] mx-auto bg-warm-bg shadow-sm">
    <header class="px-6 py-5 border-b border-black/5">
      <h1 class="text-[15px] font-medium text-dark-text tracking-[-0.01em]">Assistant</h1>
      <p class="text-xs font-light text-muted">Ready to help</p>
    </header>

    <MessageList :messages="visibleMessages" :is-typing="isTyping" />

    <ChatInput :disabled="isTyping" @submit="handleSend" />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import type { Message } from '../lib/types'
import type { LlmProvider } from '../lib/llmProvider'

const provider = inject<LlmProvider>('llmProvider')!

let nextId = 0

const messages = ref<Message[]>([
  { id: String(nextId++), role: 'assistant', content: "Hello! How can I help you today?" },
])

const visibleMessages = computed(() => messages.value.filter((m) => m.role !== 'system'))

const isTyping = ref(false)

async function handleSend(text: string) {
  const userMsg: Message = { id: String(nextId++), role: 'user', content: text }
  messages.value.push(userMsg)

  isTyping.value = true
  try {
    if (typeof provider.sendMessageStream === 'function') {
      const assistantId = String(nextId++)
      const index = messages.value.length
      messages.value.push({ id: assistantId, role: 'assistant', content: '' })

      await provider.sendMessageStream(messages.value, (chunk) => {
        const msg = messages.value[index]
        if (msg) msg.content += chunk
      })
    } else {
      const response = await provider.sendMessage(messages.value)
      messages.value.push({ id: String(nextId++), role: 'assistant', content: response })
    }
  } finally {
    isTyping.value = false
  }
}
</script>
