# MEMORY — Accumulated Project Knowledge

## Tech Gotchas
<!-- Tagged: #api #ui #build — AI searches by tag -->
<!-- ⚡ = broke in production, non-negotiable guardrail -->

- **#vue**: `defineProps` in `<script setup>` — capture return value (`const props = defineProps<...>()`) when using props in `watch()` callbacks. Destructured variable access works in templates but can fail in script watchers.
- **#build**: `vue-tsc -b` catches unused imports that `vite build` alone will miss. Always run the full build command (`vue-tsc -b && vite build`), not just `vite build`.
- **#testing**: Async component tests that rely on provider responses need explicit `setTimeout(10)` + `$nextTick()` beyond just `$nextTick()`. Promise resolution happens between microtasks.
- **#ui**: Tailwind CSS v4 animation arbitrary values (`animate-[typing_1.4s_ease-in-out_infinite]`) require corresponding `@keyframes` defined statically. Dynamic keyframe names won't work.
- **#skills**: Skills that output structured JSON must include a JSON Schema in references/ and instruct the LLM to validate against it. Without a formal schema, LLMs invent their own field names and structure — the without-skill baseline scored 0% across all evals.
- **#skills**: Implicit requirements must be explicit in skill instructions. If the user says "I want feature X" but doesn't provide details, the skill must explicitly say "ask for the details." Don't rely on the LLM to infer this — it will default to null.

## Patterns That Worked
<!-- Reusable patterns discovered across features -->

- **Provider pattern via inject/provide**: App.vue provides a service interface; components inject it. Minimal coupling — backend swap needs only a new implementation + one line change.
- **Component bottom-up ordering**: Build leaf components with isolated tests first, compose later. Reduces debugging surface per commit.
- **Auto-scroll with `watch` + `nextTick`**: Watch data changes → `nextTick` → `scrollTop = scrollHeight`. Clean and reliable for chat/message UIs.
- **Skill Creator eval workflow**: Parallel subagents (with + without skill) → grading script → mkviewer. Catches structural issues immediately. Without-skill baselines prove the skill's value quantitatively.
- **Schema-first skill output**: Provide an exact JSON Schema as output contract. Dramatically improves consistency and makes automated grading possible.
- **Skill eval grading scripts**: Write a reusable `grade.py` that combines jsonschema validation with assertion-specific checks. Can be used across iterations.

## Architecture Decisions
<!-- ADRs made during spec-driven development -->
- ADR-001: Specs in specs/ separate from docs/ (permanent reference vs per-feature artifacts)
- ADR-002: `LlmProvider` as abstract TypeScript interface in `ui/src/lib/`. Future LLM integrations implement this interface. UI components never change.
- ADR-003: Vue 3 `provide/inject` for dependency injection of providers. No prop drilling. Works at any component depth.
- ADR-004: Skills live in `skill/` directory. Each skill follows Skill Creator workflow: draft → eval → iterate. Skills are loaded by the remote LLM through the `LlmProvider` interface.
- ADR-005: MCP/API configurations for skills use placeholders in `references/config.md`. No hardcoded endpoints. Deployers replace placeholders with real values.

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
| `skill/project-initializer/SKILL.md` | 002-project-initializer-skill | Main skill: 7-phase conversation flow |
| `skill/project-initializer/references/form-fields.md` | 002-project-initializer-skill | Field definitions + constraints |
| `skill/project-initializer/references/config.md` | 002-project-initializer-skill | MCP endpoint placeholders |
| `skill/project-initializer/references/output-schema.json` | 002-project-initializer-skill | JSON output schema |
| `skill/project-initializer/assets/state-schema.json` | 002-project-initializer-skill | Resume state schema |
| `skill/project-initializer/evals/evals.json` | 002-project-initializer-skill | Test cases + assertions |
| `skill/project-initializer/evals/grade.py` | 002-project-initializer-skill | Auto-grading script |

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
