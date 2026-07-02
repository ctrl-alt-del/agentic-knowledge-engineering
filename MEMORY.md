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
- **#llm**: Anthropic API's `system` field goes at the request body top level, not inside `messages[]`. The `system` role messages must be extracted from the conversation array and placed separately. OpenAI embeds system messages directly in the `messages[]` array.
- **#llm**: Vite browser environment has no `process.env`. Use `import.meta.env` for environment variables instead.
- **#vue**: `shallowRef` + wrapper pattern — when `provide/inject` dependencies need runtime replacement, wrap the actual implementation in a `shallowRef` and provide a proxy object that delegates to `.value`. The proxy's method calls always resolve to the current value.
- **#ui**: TypeScript ESM module scope — function declarations are NOT reliably hoisted when transpiled via `tsx` or similar tools. Define helper functions BEFORE the functions that call them, even if they would be hoisted in standard JavaScript.
- **#portability**: Keep agent core (`agent/`) separate from UI and server. `agent/` contains skills + knowledge + memory — platform-agnostic. `ui_lite/` and `serve.py` are one of many possible UI/server layers.
- **#index**: Pre-built inverted index (build-index.py) is faster than runtime search for knowledge bases. Browser loads index JSON → in-memory search → fetch relevant files lazily. Index stores metadata + previews only (not full content).
- **#memory**: Memory distillation should be transparent to users — trigger on idle (30s) or manual button. Distilled entries should have clear `sources` (knowledge file + session ID) for traceability.
- **#security**: Python's `http.server` binds 0.0.0.0 by default. Always bind to 127.0.0.1 in local dev servers. Block `/config/` directory from direct HTTP access.

## Patterns That Worked
<!-- Reusable patterns discovered across features -->

- **Provider pattern via inject/provide**: App.vue provides a service interface; components inject it. Minimal coupling — backend swap needs only a new implementation + one line change.
- **Component bottom-up ordering**: Build leaf components with isolated tests first, compose later. Reduces debugging surface per commit.
- **Auto-scroll with `watch` + `nextTick`**: Watch data changes → `nextTick` → `scrollTop = scrollHeight`. Clean and reliable for chat/message UIs.
- **Skill Creator eval workflow**: Parallel subagents (with + without skill) → grading script → mkviewer. Catches structural issues immediately. Without-skill baselines prove the skill's value quantitatively.
- **Schema-first skill output**: Provide an exact JSON Schema as output contract. Dramatically improves consistency and makes automated grading possible.
- **Skill eval grading scripts**: Write a reusable `grade.py` that combines jsonschema validation with assertion-specific checks. Can be used across iterations.
- **Config-driven provider pattern**: Single JSON config file controls LLM type, model, API parameters, and skill auto-loading. Provider factory creates the right implementation at runtime. Switching from mock to real API is a one-line config change.
- **SSE stream parsing via `fetch().body.getReader()`**: No SDK needed. Both OpenAI (`data:` lines + `[DONE]`) and Anthropic (`event:`/`data:` lines + `message_stop`) SSE formats can be parsed with the same reader pattern, isolating protocol differences in each provider class.
- **`shallowRef` for injectable services**: When a service needs dynamic replacement after setup, hold the actual implementation in a `shallowRef` and provide a stable proxy object. Components inject once, always get the current implementation.
- **Zero-dependency markdown parser**: Four-stage pipeline: HTML-escape → code block isolation → paragraph/list block parsing → inline markdown replacement. Covers 90%+ of chat content with zero npm dependencies. Usable in both TypeScript modules and inline `<script>`.
- **Copy-to-clipboard UX**: `navigator.clipboard.writeText()` + brief visual feedback ("Copied!" for 1.5s). Graceful fallback if clipboard API unavailable. Works in all modern browsers in secure contexts.
- **Pre-built inverted index for local search**: `build-index.py` walks knowledge directory, parses markdown sections, tokenizes, builds JSON index. Browser fetches index at startup, searches in-memory with <50ms latency. Index stores only metadata + 200-char previews — full content fetched lazily.
- **agent/ portability pattern**: `agent/` = skills + knowledge + memory (platform-agnostic). `ui_lite/` = optional browser UI. `serve.py` = optional local server. Clean separation enables deployment to AgentScope, custom platforms, etc. without carrying UI code.
- **Anti-fabrication via context constraint**: Inject knowledge chunks as `[Knowledge: source#section]` system messages. Skill instructions enforce "only answer from [Knowledge] blocks, cite sources, confidence score." Multiple layers prevent fabrication.

## Architecture Decisions
<!-- ADRs made during spec-driven development -->
- ADR-001: Specs per feature in `features/<feature>/specs/`. `specs/SDD.md` and `specs/_template/` are project-wide scaffolding.
- ADR-002: `LlmProvider` as abstract TypeScript interface in feature's `ui/src/lib/`. Future LLM integrations implement this interface. UI components never change.
- ADR-003: Vue 3 `provide/inject` for dependency injection of providers. No prop drilling. Works at any component depth.
- ADR-004: Skills live in `features/<feature>/skill/`. Each skill follows Skill Creator workflow: draft → eval → iterate. Skills are loaded by the remote LLM through the `LlmProvider` interface.
- ADR-005: MCP/API configurations for skills use placeholders in `references/config.md`. No hardcoded endpoints. Deployers replace placeholders with real values.
- ADR-006: Project-level LLM configuration in `ake.json` (gitignored), with `ake.example.json` as committed template. Uses provider factory pattern to create the right `LlmProvider` at runtime without code changes.
- ADR-007: Zero-SDK-dependency API integration. Both OpenAI and Anthropic APIs are accessed via plain `fetch()`, avoiding npm packages like `@anthropic-ai/sdk` and `openai`. SSE stream parsing is handled manually per protocol.
- ADR-008: `agent/` is platform-agnostic core. `ui_lite/`, `serve.py`, `config/` are local-dev only. Each feature's `agent/` can be deployed independently.
- ADR-009: Pre-built inverted index (build-index.py) over runtime search. Browser loads index JSON, searches in-memory, fetches relevant knowledge files lazily.
- ADR-010: Knowledge sources are read-only. All learning from conversations goes into MEMORY, which evolves separately from the sources.
- ADR-011: Multi-skill architecture with orchestrator pattern. Sub-skills are loaded as system messages; the LLM switches modes implicitly based on conversation state.
- ADR-012: localStorage for session memory, persistent.json for durable memory. Fast, zero-dependency, exportable.
- ADR-013: Chinese for skills/UI labels, English for code/schemas/JSON keys. Follows project convention from 002-project-initializer-skill.

## Code Ownership Map

| File | Touched By | Why |
|------|-----------|-----|
| `features/init-chat/ui/src/lib/llmProvider.ts` | 001-chat-ui | Core abstraction for AI backends |
| `features/init-chat/ui/src/lib/mockResponder.ts` | 001-chat-ui | Demo responder, replaced by real LLM later |
| `features/init-chat/ui/src/lib/types.ts` | 001-chat-ui | Shared Message type |
| `features/init-chat/ui/src/components/ChatContainer.vue` | 001-chat-ui | Main chat orchestration |
| `features/init-chat/ui/src/components/MessageList.vue` | 001-chat-ui | Scrollable message display |
| `features/init-chat/ui/src/components/MessageBubble.vue` | 001-chat-ui | Single message rendering |
| `features/init-chat/ui/src/components/ChatInput.vue` | 001-chat-ui | Text input + send |
| `features/init-chat/ui/src/App.vue` | 001-chat-ui | Provider wiring |
| `features/init-chat/skill/project-initializer/SKILL.md` | 002-project-initializer-skill | Main skill: 7-phase conversation flow |
| `features/init-chat/skill/project-initializer/references/form-fields.md` | 002-project-initializer-skill | Field definitions + constraints |
| `features/init-chat/skill/project-initializer/references/config.md` | 002-project-initializer-skill | MCP endpoint placeholders |
| `features/init-chat/skill/project-initializer/references/output-schema.json` | 002-project-initializer-skill | JSON output schema |
| `features/init-chat/skill/project-initializer/assets/state-schema.json` | 002-project-initializer-skill | Resume state schema |
| `features/init-chat/skill/project-initializer/evals/evals.json` | 002-project-initializer-skill | Test cases + assertions |
| `features/init-chat/skill/project-initializer/evals/grade.py` | 002-project-initializer-skill | Auto-grading script |
| `ake.example.json` | 003-llm-api-config | Config template (committed) |
| `ake.schema.json` | 003-llm-api-config | Config validation schema |
| `features/init-chat/ui/src/lib/config.ts` | 003-llm-api-config | Config loader + types |
| `features/init-chat/ui/src/lib/openAiProvider.ts` | 003-llm-api-config | OpenAI-compatible provider |
| `features/init-chat/ui/src/lib/anthropicProvider.ts` | 003-llm-api-config | Anthropic provider |
| `features/init-chat/ui/src/lib/skillLoader.ts` | 003-llm-api-config | Skill loading from paths |
| `features/init-chat/ui/src/components/ConfigStatus.vue` | 003-llm-api-config | Connection status indicator |
| `features/init-chat/ui/src/App.vue` | 001-chat-ui, 003-llm-api-config | Provider wiring + skill loading |
| `features/init-chat/ui/src/lib/llmProvider.ts` | 001-chat-ui, 003-llm-api-config | Core abstraction (updated: streaming + messages array) |
| `features/init-chat/ui/src/lib/types.ts` | 001-chat-ui, 003-llm-api-config | Shared Message type (updated: system role) |
| `features/init-chat/ui_lite/index.html` | 001-chat-ui, 003-llm-api-config, 004-chat-markdown-copy | Zero-dependency demo: pure HTML/CSS/JS chat UI |
| `features/init-chat/ui/src/lib/markdown.ts` | 004-chat-markdown-copy | Zero-dependency markdown parser |
| `features/init-chat/ui/src/components/MessageBubble.vue` | 001-chat-ui, 004-chat-markdown-copy | Single message rendering (updated: markdown, copy, timestamp) |
| `features/qna-agent/build-index.py` | 005-qna-agent | Inverted index builder (Python stdlib) |
| `features/qna-agent/serve.py` | 005-qna-agent | Zero-dependency HTTP server |
| `features/qna-agent/ui_lite/index.html` | 005-qna-agent | Browser Q&A UI with sidebar + search |
| `features/qna-agent/agent/skill/*/SKILL.md` | 005-qna-agent | Multi-skill architecture (orchestrator, retrieval, curation) |
| `features/qna-agent/agent/memory/persistent.json` | 005-qna-agent | Self-evolving agent memory |
| `features/qna-agent/agent/knowledge-sources.json` | 005-qna-agent | Portable knowledge source config |

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
