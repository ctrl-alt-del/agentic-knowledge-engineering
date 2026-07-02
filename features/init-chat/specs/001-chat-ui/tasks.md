# Chat UI — Tasks

## Block 0: Spec & Design (before code)
- [x] `doc-coauthoring`: spec.md + plan.md reviewed
- [x] `canvas-design`: mockup generated → `ux-ui/mockup.html`
- [x] `test_plan.md`: test scenarios documented

## Block 1: Scaffold

- [x] **Task 1.1**: Scaffold Vue 3 + TypeScript + Tailwind CSS project in `features/init-chat/ui/` + create `README.md`
  - Files: `features/init-chat/ui/` (entire Vite scaffold), `README.md`
  - Build: `cd ui && npm install && npm run dev`
  - Tests: `cd ui && npx vitest run` (no tests yet, just verify setup)

## Block 2: Core Logic

- [x] **Task 2.1**: Create `LlmProvider` interface + `MockResponder` implementation
  - Files: `features/init-chat/ui/src/lib/llmProvider.ts`, `features/init-chat/ui/src/lib/mockResponder.ts`
  - Build: `cd ui && npm run build`
  - Tests: `cd ui && npm test` (unit tests for mockResponder)

## Block 3: Components

- [x] **Task 3.1**: Build `MessageBubble` component
  - Files: `features/init-chat/ui/src/components/MessageBubble.vue`
  - Build: `cd ui && npm run build`
  - Tests: `cd ui && npm test` (render tests for user/assistant roles, content, edge cases)

- [x] **Task 3.2**: Build `ChatInput` component
  - Files: `features/init-chat/ui/src/components/ChatInput.vue`
  - Build: `cd ui && npm run build`
  - Tests: `cd ui && npm test` (input binding, submit, empty blocking)

- [x] **Task 3.3**: Build `MessageList` component
  - Files: `features/init-chat/ui/src/components/MessageList.vue`
  - Build: `cd ui && npm run build`
  - Tests: `cd ui && npm test` (renders list, auto-scroll)

## Block 4: Integration

- [x] **Task 4.1**: Build `ChatContainer` + wire into `App.vue` with provider injection
  - Files: `features/init-chat/ui/src/components/ChatContainer.vue`, `features/init-chat/ui/src/App.vue`
  - Build: `cd ui && npm run build`
  - Tests: `cd ui && npm test` (full integration: send → response → render)
