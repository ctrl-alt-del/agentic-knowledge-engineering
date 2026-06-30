# Chat UI — Takeaways

## What Went Well

- The `LlmProvider` interface decoupled the UI from the backend cleanly. Swapping the mock for a real LLM requires only a new class + one line change in App.vue.
- `provide/inject` in Vue 3 worked perfectly for provider injection — no prop drilling through the component tree.
- Tailwind CSS v4 with `@tailwindcss/vite` plugin required zero config files beyond the CSS `@theme` block.
- Building components bottom-up (MessageBubble → ChatInput → MessageList → ChatContainer) kept each task independently testable.

## What We Learned

- `defineProps` in `<script setup>` with TypeScript generics requires capturing the return value for `watch` callbacks. Direct variable access works in templates but can fail in script watchers.
- Vitest + happy-dom handles Vue component tests well. Integration tests that wait for async responses need explicit promise flushing beyond `$nextTick()`.
- Tailwind CSS v4 animation utilities need explicit `animate-[keyframes]` syntax; the `@keyframes` must be defined in the parent stylesheet or as arbitrary values.

## API / Tech Surprises

- Tailwind CSS v4 inlines keyframes in the build; custom keyframe names in arbitrary values need the exact CSS keyframes available at compile time. The typing indicator animation uses an arbitrary value `animate-[typing_1.4s_ease-in-out_infinite]` which requires the keyframes to be defined somewhere accessible.
- `vue-tsc -b` catches unused imports (like `vi` from vitest) unlike only `vite build`.

## Patterns Worth Reusing

- **Provider pattern via inject/provide**: App.vue provides a service interface; components inject it. Works for any backend swap (LLM, auth, storage).
- **Component bottom-up ordering**: Build leaf components with isolated tests first, compose later. Reduces debugging surface per commit.
- **Auto-scroll with `watch` + `nextTick`**: Watching `messages.length` and `isTyping`, then `nextTick` → `scrollTop = scrollHeight` is clean and reliable.
