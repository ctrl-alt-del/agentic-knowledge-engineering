<template>
  <div class="h-screen flex flex-col max-w-[480px] mx-auto bg-warm-bg shadow-sm">
    <header class="px-6 py-5 border-b border-black/5">
      <h1 class="text-[15px] font-medium text-dark-text tracking-[-0.01em]">Assistant</h1>
      <p class="text-xs font-light text-muted">Ready to help</p>
    </header>

    <MessageList :messages="messages" :is-typing="isTyping" />

    <ChatInput :disabled="isTyping" @submit="handleSend" />
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import type { Message } from '../lib/types'
import type { LlmProvider } from '../lib/llmProvider'

const provider = inject<LlmProvider>('llmProvider')!

let nextId = 0

const messages = ref<Message[]>([
  { id: String(nextId++), role: 'assistant', content: "Hello! How can I help you today?" },
])

const isTyping = ref(false)

async function handleSend(text: string) {
  messages.value.push({ id: String(nextId++), role: 'user', content: text })

  isTyping.value = true
  try {
    const response = await provider.sendMessage(text)
    messages.value.push({ id: String(nextId++), role: 'assistant', content: response })
  } finally {
    isTyping.value = false
  }
}
</script>
