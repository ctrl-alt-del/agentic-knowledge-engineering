# MEMORY — Accumulated Project Knowledge

## Tech Gotchas
<!-- Tagged: #api #ui #build — AI searches by tag -->
<!-- ⚡ = broke in production, non-negotiable guardrail -->

- **#skills**: Skills that output structured JSON must include a JSON Schema in references/ and instruct the LLM to validate against it. Without a formal schema, LLMs invent their own field names and structure — the without-skill baseline scored 0% across all evals.
- **#skills**: Implicit requirements must be explicit in skill instructions. If the user says "I want feature X" but doesn't provide details, the skill must explicitly say "ask for the details." Don't rely on the LLM to infer this — it will default to null.
- **#llm**: Anthropic API's `system` field goes at the request body top level, not inside `messages[]`. The `system` role messages must be extracted from the conversation array and placed separately. OpenAI embeds system messages directly in the `messages[]` array.
- **#portability**: Keep agent core (`agent/`) separate from UI and server. `agent/` contains skills + knowledge + memory — platform-agnostic. `ui_lite/` and `serve.py` are one of many possible UI/server layers.
- **#index**: Pre-built inverted index (build-index.py) is faster than runtime search for knowledge bases. Browser loads index JSON → in-memory search → fetch relevant files lazily. Index stores metadata + previews only (not full content).
- **#memory**: Memory distillation should be transparent to users — trigger on idle (30s) or manual button. Distilled entries should have clear `sources` (knowledge file + session ID) for traceability.
- **#security**: Python's `http.server` binds 0.0.0.0 by default. Always bind to 127.0.0.1 in local dev servers. Block `/config/` directory from direct HTTP access.
- **#security ⚡**: Never serve the raw API key to the browser. `serve.py` proxies LLM calls server-side and redacts `llm.apiKey` in the served `/ake.json` to a sentinel (`"configured"`) — the real key is read from disk only inside `do_POST`. Redact to a non-placeholder sentinel, not empty/removed, or the UI's connected-check drops to Mock. Never log the key/body/headers.
- **#build**: Browser `fetch()` → LLM API hits CORS. Fix for local dev: proxy through the stdlib server. Override `end_headers()` to inject `Access-Control-Allow-Origin: *` on ALL responses (not per-handler), and add a `do_POST` that forwards to `{baseURL}{path}` via `urllib.request`. Client picks proxy (absolute path) vs direct (`baseURL`) by hostname check (`localhost`/`127.0.0.1`). Resolves the CORS risk logged in 003-llm-api-config.
- **#build**: stdlib SSE streaming passthrough — `urllib.request.urlopen()` then loop `read(1024)` → `wfile.write()` + `wfile.flush()`. `urllib.error.HTTPError` is itself readable, so forward upstream error status + `.read()` body verbatim.

## Patterns That Worked
<!-- Reusable patterns discovered across features -->

- **Skill Creator eval workflow**: Parallel subagents (with + without skill) → grading script → mkviewer. Catches structural issues immediately. Without-skill baselines prove the skill's value quantitatively.
- **Schema-first skill output**: Provide an exact JSON Schema as output contract. Dramatically improves consistency and makes automated grading possible.
- **Skill eval grading scripts**: Write a reusable `grade.py` that combines jsonschema validation with assertion-specific checks. Can be used across iterations.
- **Config-driven provider pattern**: Single JSON config file controls LLM type, model, API parameters, and skill auto-loading. Provider factory creates the right implementation at runtime. Switching from mock to real API is a one-line config change.
- **SSE stream parsing via `fetch().body.getReader()`**: No SDK needed. Both OpenAI (`data:` lines + `[DONE]`) and Anthropic (`event:`/`data:` lines + `message_stop`) SSE formats can be parsed with the same reader pattern, isolating protocol differences in each provider class.
- **Zero-dependency markdown parser**: Four-stage pipeline: HTML-escape → code block isolation → paragraph/list block parsing → inline markdown replacement. Covers 90%+ of chat content with zero npm dependencies. Usable in both TypeScript modules and inline `<script>`.
- **Copy-to-clipboard UX**: `navigator.clipboard.writeText()` + brief visual feedback ("Copied!" for 1.5s). Graceful fallback if clipboard API unavailable. Works in all modern browsers in secure contexts.
- **Pre-built inverted index for local search**: `build-index.py` walks knowledge directory, parses markdown sections, tokenizes, builds JSON index. Browser fetches index at startup, searches in-memory with <50ms latency. Index stores only metadata + 200-char previews — full content fetched lazily.
- **agent/ portability pattern**: `agent/` = skills + knowledge + memory (platform-agnostic). `ui_lite/` = optional browser UI. `serve.py` = optional local server. Clean separation enables deployment to AgentScope, custom platforms, etc. without carrying UI code.
- **Anti-fabrication via context constraint**: Inject knowledge chunks as `[Knowledge: source#section]` system messages. Skill instructions enforce "only answer from [Knowledge] blocks, cite sources, confidence score." Multiple layers prevent fabrication.

## Architecture Decisions
<!-- ADRs made during spec-driven development -->
- ADR-001: Specs per feature in `features/<feature>/specs/`. `specs/SDD.md` and `specs/_template/` are project-wide scaffolding.
- ADR-002: Modular LLM backends with config-driven provider switching. Both OpenAI-compatible and Anthropic APIs supported via plain `fetch()`. UI swaps between mock and real LLM at config level.
- ADR-004: Skills live in `features/<feature>/skill/`. Each skill follows Skill Creator workflow: draft → eval → iterate. Skills are loaded by the remote LLM through the `LlmProvider` interface.
- ADR-005: MCP/API configurations for skills use placeholders in `references/config.md`. No hardcoded endpoints. Deployers replace placeholders with real values.
- ADR-006: Project-level LLM configuration in `ake.json` at project root (gitignored), with `ake.example.json` as committed template. Served to the browser by `serve.py` via explicit `/ake.json` endpoint. Uses provider factory pattern to create the right backend at runtime without code changes.
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
| `features/init-chat/skill/project-initializer/SKILL.md` | 002-project-initializer-skill | Main skill: 7-phase conversation flow |
| `features/init-chat/skill/project-initializer/references/form-fields.md` | 002-project-initializer-skill | Field definitions + constraints |
| `features/init-chat/skill/project-initializer/references/config.md` | 002-project-initializer-skill | MCP endpoint placeholders |
| `features/init-chat/skill/project-initializer/references/output-schema.json` | 002-project-initializer-skill | JSON output schema |
| `features/init-chat/skill/project-initializer/assets/state-schema.json` | 002-project-initializer-skill | Resume state schema |
| `features/init-chat/skill/project-initializer/evals/evals.json` | 002-project-initializer-skill | Test cases + assertions |
| `features/init-chat/skill/project-initializer/evals/grade.py` | 002-project-initializer-skill | Auto-grading script |
| `features/init-chat/ui_lite/index.html` | 001-chat-ui, 003-llm-api-config, 004-chat-markdown-copy, 006-serve-llm-proxy | Zero-dependency demo: pure HTML/CSS/JS chat UI; `proxyUrl()` picks proxy vs direct |
| `features/init-chat/serve.py` | 003-llm-api-config, 006-serve-llm-proxy, migration | Zero-dependency dev server; serves ake.json (key redacted), proxies LLM calls, CORS |
| `features/qna-agent/build-index.py` | 005-qna-agent | Inverted index builder (Python stdlib) |
| `features/qna-agent/serve.py` | 005-qna-agent, 007-qna-serve-llm-proxy | Zero-dependency HTTP server; proxies LLM calls, CORS, redacts key |
| `features/qna-agent/ui_lite/index.html` | 005-qna-agent, 007-qna-serve-llm-proxy | Browser Q&A UI with sidebar + search; `proxyUrl()` picks proxy vs direct |
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
