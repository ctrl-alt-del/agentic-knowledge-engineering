<template>
  <div
    ref="listRef"
    class="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4"
  >
    <MessageBubble
      v-for="msg in messages"
      :key="msg.id"
      :role="msg.role"
      :content="msg.content"
      :timestamp="msg.timestamp"
    />

    <div v-if="isTyping" class="self-start px-4 py-3 rounded-2xl rounded-bl-md bg-cool-assistant flex gap-1.5 items-center">
      <span class="w-1.5 h-1.5 rounded-full bg-[#b0b8c4] animate-[typing_1.4s_ease-in-out_infinite]" />
      <span class="w-1.5 h-1.5 rounded-full bg-[#b0b8c4] animate-[typing_1.4s_ease-in-out_infinite]" style="animation-delay: 0.2s" />
      <span class="w-1.5 h-1.5 rounded-full bg-[#b0b8c4] animate-[typing_1.4s_ease-in-out_infinite]" style="animation-delay: 0.4s" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MessageBubble from './MessageBubble.vue'
import type { Message } from '../lib/types'

const props = defineProps<{
  messages: Message[]
  isTyping: boolean
}>()

const listRef = ref<HTMLElement | null>(null)

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight
      }
    })
  },
)

watch(
  () => props.isTyping,
  (typing) => {
    if (typing) {
      nextTick(() => {
        if (listRef.value) {
          listRef.value.scrollTop = listRef.value.scrollHeight
        }
      })
    }
  },
)
</script>
