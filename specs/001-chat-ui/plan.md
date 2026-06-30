---
feature_id: "001"
name: "Chat UI"
status: "✅ Done"
depends_on: []
touches:
  - "ui/package.json"
  - "ui/vite.config.ts"
  - "ui/tsconfig.json"
  - "ui/tsconfig.app.json"
  - "ui/tsconfig.node.json"
  - "ui/tailwind.config.js"
  - "ui/postcss.config.js"
  - "ui/index.html"
  - "ui/src/main.ts"
  - "ui/src/style.css"
  - "ui/src/vite-env.d.ts"
  - "ui/src/App.vue"
  - "ui/src/components/ChatContainer.vue"
  - "ui/src/components/MessageList.vue"
  - "ui/src/components/MessageBubble.vue"
  - "ui/src/components/ChatInput.vue"
  - "ui/src/lib/llmProvider.ts"
  - "ui/src/lib/mockResponder.ts"
  - "README.md"
created: "2026-06-30"
---

# Chat UI — Plan

## Approach

1. **Scaffold**: `npm create vue@latest` for Vue 3 + TypeScript, add Tailwind CSS manually
2. **Abstraction first**: Define `LlmProvider` TypeScript interface (`sendMessage(content: string) => Promise<string>`) before any component
3. **Mock responder**: Implement `MockResponder` class implementing `LlmProvider`, returning random pre-written responses with simulated delay (300–1500ms)
4. **Components bottom-up**: Build leaf components (MessageBubble, ChatInput) → compose into MessageList → wire into ChatContainer → mount in App.vue
5. **Provider injection**: Use Vue `provide/inject` so App.vue provides the current `LlmProvider`; components inject it without prop drilling
6. **Future LLM swap**: Create a new class implementing `LlmProvider` (e.g., `OpenAiProvider`) → change one line in App.vue's `provide`. Components never change.

## Files to Create / Change

| Action | File | Rationale |
|--------|------|-----------|
| Create | `ui/` — full Vite + Vue 3 + TS + Tailwind scaffold | Project bootstrap |
| Create | `ui/src/lib/llmProvider.ts` | Abstract interface for any AI backend |
| Create | `ui/src/lib/mockResponder.ts` | Random answers with delay for demo |
| Create | `ui/src/components/MessageBubble.vue` | Reusable message display |
| Create | `ui/src/components/MessageList.vue` | Scrollable list with auto-scroll |
| Create | `ui/src/components/ChatInput.vue` | Text input + send affordance |
| Create | `ui/src/components/ChatContainer.vue` | Layout shell wiring components |
| Create | `ui/src/App.vue` | Root: provides LlmProvider, mounts ChatContainer |
| Create | `README.md` | Project overview, setup, tech stack |

## Risks

- **Undecided test framework**: Need Vitest + @vue/test-utils. None configured yet — scaffold handles this.
- **Tailwind + Vue SFC scoping**: Tailwind classes in `<style scoped>` need verification.
- **Mock → LLM migration**: Mitigated by the `LlmProvider` interface — no component code changes needed.

## Dependencies

- None. This is the first feature.
