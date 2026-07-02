<template>
  <div v-if="show" class="flex items-center gap-2">
    <span
      :class="[
        'w-2 h-2 rounded-full',
        status === 'connected' ? 'bg-green-500' : status === 'mock' ? 'bg-yellow-400' : 'bg-red-500',
      ]"
    />
    <span class="text-xs font-light text-muted">
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'connected' | 'mock' | 'error'
  providerName: string
  modelName: string
  show: boolean
}>()

const label = computed(() => {
  if (props.status === 'mock') return 'Mock'
  return `${props.providerName} · ${props.modelName}`
})
</script>
