<template>
  <template v-if="role !== 'system'">
    <div
      :class="[
        'max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words group',
        role === 'user'
          ? 'self-end bg-warm-user text-dark-text rounded-br-md'
          : 'self-start bg-cool-assistant text-cool-text rounded-bl-md',
      ]"
      :style="{ animationDelay: '0s' }"
    >
      <div class="text-[10px] font-medium uppercase tracking-wider opacity-50 mb-1">
        {{ role === 'user' ? 'You' : 'Assistant' }}
      </div>
      <div v-html="renderedContent" class="[&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-black/10 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-semibold" />
    </div>
    <div class="flex items-center justify-between mt-1" :class="role === 'user' ? 'flex-row-reverse' : ''">
      <span class="text-[10px] text-muted/60">{{ timestamp }}</span>
      <button
        class="text-muted/40 hover:text-muted/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 text-[10px] flex items-center gap-1"
        @click="copyContent"
        :aria-label="'Copy message'"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span v-if="copied" class="text-[10px]">Copied!</span>
      </button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { renderMarkdown } from '../lib/markdown'

const props = defineProps<{
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: string
}>()

const copied = ref(false)

const renderedContent = computed(() => renderMarkdown(props.content))

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    // clipboard unavailable
  }
}
</script>
