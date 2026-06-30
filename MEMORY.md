# MEMORY — Accumulated Project Knowledge

## Tech Gotchas
<!-- Tagged: #api #ui #build — AI searches by tag -->
<!-- ⚡ = broke in production, non-negotiable guardrail -->

- **#vue**: `defineProps` in `<script setup>` — capture return value (`const props = defineProps<...>()`) when using props in `watch()` callbacks. Destructured variable access works in templates but can fail in script watchers.
- **#build**: `vue-tsc -b` catches unused imports that `vite build` alone will miss. Always run the full build command (`vue-tsc -b && vite build`), not just `vite build`.
- **#testing**: Async component tests that rely on provider responses need explicit `setTimeout(10)` + `$nextTick()` beyond just `$nextTick()`. Promise resolution happens between microtasks.
- **#ui**: Tailwind CSS v4 animation arbitrary values (`animate-[typing_1.4s_ease-in-out_infinite]`) require corresponding `@keyframes` defined statically. Dynamic keyframe names won't work.

## Patterns That Worked
<!-- Reusable patterns discovered across features -->

- **Provider pattern via inject/provide**: App.vue provides a service interface (like `LlmProvider`); components inject it. Minimal coupling — backend swap needs only a new implementation + one line change.
- **Component bottom-up ordering**: Build leaf components with isolated tests first, compose later. Reduces debugging surface per commit.
- **Auto-scroll with `watch` + `nextTick`**: Watch data changes → `nextTick` → `scrollTop = scrollHeight`. Clean and reliable for chat/message UIs.

## Architecture Decisions
<!-- ADRs made during spec-driven development -->
- ADR-001: Specs in specs/ separate from docs/ (permanent reference vs per-feature artifacts)
- ADR-002: `LlmProvider` as abstract TypeScript interface in `ui/src/lib/`. Future LLM integrations (OpenAI, Claude) implement this interface. UI components never change.
- ADR-003: Vue 3 `provide/inject` for dependency injection of providers. No prop drilling. Works at any component depth.

## Code Ownership Map

| File | Touched By | Why |
|------|-----------|-----|
| `ui/src/lib/llmProvider.ts` | 001-chat-ui | Core abstraction for AI backends |
| `ui/src/lib/mockResponder.ts` | 001-chat-ui | Demo responder, replaced by real LLM later |
| `ui/src/lib/types.ts` | 001-chat-ui | Shared Message type |
| `ui/src/components/ChatContainer.vue` | 001-chat-ui | Main chat orchestration |
| `ui/src/components/MessageList.vue` | 001-chat-ui | Scrollable message display |
| `ui/src/components/MessageBubble.vue` | 001-chat-ui | Single message rendering |
| `ui/src/components/ChatInput.vue` | 001-chat-ui | Text input + send |
| `ui/src/App.vue` | 001-chat-ui | Provider wiring |

## Common Bugs Fixed

## AI Workflow Rule

Before writing any spec, read in order:
1. `AGENTS.md` — project conventions
2. `specs/SDD.md` — SDD workflow
3. `knowledge/index.md` — if `knowledge/` directory exists, read the index for
   architecture, data models, APIs, patterns, and gotchas. Traverse any domain
   files relevant to the feature.
4. `MEMORY.md` — search for relevant #tags
5. `specs/index.md` — check for feature file conflicts

If the project has no `knowledge/` directory but has existing source code, run
`codebase-to-sdd-knowledge` first to generate it.

After shipping a feature:
1. Write `takeaways.md` in the feature folder
2. Curate findings into `MEMORY.md` (tagged, ⚡ for critical)
3. Update code ownership map
