<template>
  <ChatContainer />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ChatContainer from './components/ChatContainer.vue'
import { MockResponder } from './lib/mockResponder'

const provider = new MockResponder()
provide('llmProvider', provider)
</script>
