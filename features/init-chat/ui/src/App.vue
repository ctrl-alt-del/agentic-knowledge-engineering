<template>
  <div class="h-screen flex flex-col max-w-[480px] mx-auto bg-warm-bg shadow-sm">
    <header class="px-6 py-5 border-b border-black/5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-[15px] font-medium text-dark-text tracking-[-0.01em]">Assistant</h1>
          <p class="text-xs font-light text-muted">Ready to help</p>
        </div>
        <ConfigStatus
          :status="connectionStatus"
          :provider-name="providerName"
          :model-name="modelName"
          :show="true"
        />
      </div>
    </header>

    <MessageList :messages="visibleMessages" :is-typing="isTyping" />

    <ChatInput :disabled="isTyping" @submit="handleSend" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed, onMounted, shallowRef } from 'vue'
import MessageList from './components/MessageList.vue'
import ChatInput from './components/ChatInput.vue'
import ConfigStatus from './components/ConfigStatus.vue'
import type { Message } from './lib/types'
import type { LlmProvider } from './lib/llmProvider'
import type { AkeConfig } from './lib/config'
import { isConfigValid } from './lib/config'
import { MockResponder } from './lib/mockResponder'
import { OpenAiProvider } from './lib/openAiProvider'
import { AnthropicProvider } from './lib/anthropicProvider'
import { loadSkills } from './lib/skillLoader'

const connectionStatus = ref<'connected' | 'mock' | 'error'>('mock')
const providerName = ref('Mock')
const modelName = ref('')
const provider = shallowRef<LlmProvider>(new MockResponder())

const wrappedProvider: LlmProvider = {
  sendMessage(msgs: Message[]) {
    return provider.value.sendMessage(msgs)
  },
  sendMessageStream(msgs: Message[], onChunk: (chunk: string) => void) {
    const streamFn = provider.value.sendMessageStream
    if (streamFn) return streamFn.call(provider.value, msgs, onChunk)
    return provider.value.sendMessage(msgs).then((text) => { onChunk(text) })
  },
}

provide('llmProvider', wrappedProvider)

let nextId = 0

function ts(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

const messages = ref<Message[]>([])
const visibleMessages = computed(() => messages.value.filter((m) => m.role !== 'system'))
const isTyping = ref(false)

async function initProvider() {
  try {
    const response = await fetch('/ake.json')
    if (!response.ok) throw new Error('Config not found')

    const config: AkeConfig = await response.json()

    if (isConfigValid(config)) {
      providerName.value = config.llm.provider === 'anthropic' ? 'Anthropic' : 'OpenAI'
      modelName.value = config.llm.model

      provider.value = config.llm.provider === 'anthropic'
        ? new AnthropicProvider(config.llm)
        : new OpenAiProvider(config.llm)

      connectionStatus.value = 'connected'

      const skillMsgs = await loadSkills(config.skills)
      if (skillMsgs.length > 0) {
        for (const msg of skillMsgs) {
          messages.value.push({
            id: String(nextId++),
            role: 'system',
            content: msg.content,
            timestamp: ts(),
          })
        }
        messages.value.push({
          id: String(nextId++),
          role: 'assistant',
          content: '你好！我是项目初始化助手。请告诉我你想创建什么样的知识工程项目？',
          timestamp: ts(),
        })
        return
      }
    }
  } catch {
    // fall through to mock
  }

  providerName.value = 'Mock'
  modelName.value = ''
  connectionStatus.value = 'mock'

  messages.value.push({
    id: String(nextId++),
    role: 'assistant',
    content: "Hello! How can I help you today?",
    timestamp: ts(),
  })
}

onMounted(initProvider)

async function handleSend(text: string) {
  messages.value.push({ id: String(nextId++), role: 'user', content: text, timestamp: ts() })

  isTyping.value = true
  const p = provider.value
  try {
    if (typeof p.sendMessageStream === 'function') {
      const assistantId = String(nextId++)
      const index = messages.value.length
      messages.value.push({ id: assistantId, role: 'assistant', content: '', timestamp: ts() })

      await p.sendMessageStream(messages.value, (chunk) => {
        const msg = messages.value[index]
        if (msg) msg.content += chunk
      })
    } else {
      const response = await p.sendMessage(messages.value)
      messages.value.push({ id: String(nextId++), role: 'assistant', content: response, timestamp: ts() })
    }
  } finally {
    isTyping.value = false
  }
}
</script>
