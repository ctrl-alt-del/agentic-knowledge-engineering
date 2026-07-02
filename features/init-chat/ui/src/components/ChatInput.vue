<template>
  <div class="flex gap-2 items-end px-5 pt-4 pb-5 border-t border-black/5">
    <textarea
      v-model="text"
      :placeholder="'Type a message...'"
      :disabled="disabled"
      class="flex-1 px-4 py-3 border border-black/10 rounded-2xl text-sm font-normal text-dark-text bg-white outline-none transition-colors resize-none placeholder:text-[#c4bfb0] placeholder:font-light focus:border-[#c4b896] focus:shadow-[0_0_0_3px_rgba(196,184,150,0.15)]"
      rows="1"
      @keydown="onKeydown"
      @input="onInput"
    />
    <button
      :disabled="!canSend || disabled"
      class="w-11 h-11 rounded-2xl border-none bg-send cursor-pointer flex items-center justify-center transition-colors shrink-0 disabled:opacity-30 disabled:cursor-default hover:enabled:bg-[#2d2818] active:enabled:scale-95"
      @click="submit"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f8f5f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 2L11 13"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: [text: string]
}>()

const text = ref('')

const canSend = computed(() => text.value.trim().length > 0)

function onInput() {
  const el = document.querySelector('textarea') as HTMLTextAreaElement | null
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

function submit() {
  const trimmed = text.value.trim()
  if (!trimmed || !canSend.value) return
  emit('submit', trimmed)
  text.value = ''
  const el = document.querySelector('textarea') as HTMLTextAreaElement | null
  if (el) el.style.height = 'auto'
}
</script>
