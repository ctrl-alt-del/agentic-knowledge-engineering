<template>
  <template v-if="role !== 'system'">
    <div
      :class="[
        'max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words',
        role === 'user'
          ? 'self-end bg-warm-user text-dark-text rounded-br-md'
          : 'self-start bg-cool-assistant text-cool-text rounded-bl-md',
      ]"
      :style="{ animationDelay: '0s' }"
    >
      <div class="text-[10px] font-medium uppercase tracking-wider opacity-50 mb-1">
        {{ role === 'user' ? 'You' : 'Assistant' }}
      </div>
      <div>{{ content }}</div>
    </div>
  </template>
</template>

<script setup lang="ts">
defineProps<{
  role: 'system' | 'user' | 'assistant'
  content: string
}>()
</script>
