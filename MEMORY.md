# MEMORY — Accumulated Project Knowledge

## Tech Gotchas
<!-- Tagged: #api #ui #build #security #data #infra #auth -->
<!-- ⚡ = broke in production, non-negotiable guardrail -->

---
id: g-001
type: gotcha
confidence: 0.9
tags: ["skills", "output"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Skills that output structured JSON must include a JSON Schema

Skills that output structured JSON must include a JSON Schema in references/ and instruct the LLM to validate against it. Without a formal schema, LLMs invent their own field names and structure — the without-skill baseline scored 0% across all evals.


---
id: g-002
type: gotcha
confidence: 0.9
tags: ["skills", "prompting"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Implicit requirements must be explicit in skill instructions

If the user says 'I want feature X' but doesn't provide details, the skill must explicitly say 'ask for the details.' Don't rely on the LLM to infer this — it will default to null.


---
id: g-003
type: gotcha
confidence: 1.0
tags: ["llm", "api", "anthropic"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Anthropic API system field goes at request body top level, not inside messages[]

Anthropic API's `system` field goes at the request body top level, not inside `messages[]`. The `system` role messages must be extracted from the conversation array and placed separately. OpenAI embeds system messages directly in the `messages[]` array.


---
id: g-004
type: gotcha
confidence: 1.0
tags: ["portability", "architecture"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Keep agent core separate from UI and server

Keep agent core (`agent/`) separate from UI and server. `agent/` contains skills + knowledge + memory — platform-agnostic. `ui_lite/` and `serve.py` are one of many possible UI/server layers.


---
id: g-005
type: gotcha
confidence: 0.85
tags: ["index", "search", "perf"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Pre-built inverted index is faster than runtime search for knowledge bases

Pre-built inverted index (build-index.py) is faster than runtime search for knowledge bases. Browser loads index JSON → in-memory search → fetch relevant files lazily. Index stores metadata + previews only (not full content).


---
id: g-006
type: gotcha
confidence: 0.85
tags: ["memory", "ux"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Memory distillation should be transparent to users

Memory distillation should be transparent to users — trigger on idle (30s) or manual button. Distilled entries should have clear `sources` (knowledge file + session ID) for traceability.


---
id: g-007
type: gotcha
confidence: 1.0
tags: ["security", "server", "python"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Python http.server binds 0.0.0.0 by default — always bind to 127.0.0.1

Python's `http.server` binds 0.0.0.0 by default. Always bind to 127.0.0.1 in local dev servers. Block `/config/` directory from direct HTTP access.


---
id: g-008
type: gotcha
confidence: 1.0
tags: ["security", "api", "server"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ⚡ Never serve the raw API key to the browser

Never serve the raw API key to the browser. `serve.py` proxies LLM calls server-side and redacts `llm.apiKey` in the served `/ake.json` to a sentinel (`"configured"`) — the real key is read from disk only inside `do_POST`. Redact to a non-placeholder sentinel, not empty/removed, or the UI's connected-check drops to Mock. Never log the key/body/headers.


---
id: g-009
type: gotcha
confidence: 1.0
tags: ["build", "cors", "proxy"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Browser fetch() to LLM API hits CORS — fix with stdlib proxy

Browser `fetch()` → LLM API hits CORS. Fix for local dev: proxy through the stdlib server. Override `end_headers()` to inject `Access-Control-Allow-Origin: *` on ALL responses (not per-handler), and add a `do_POST` that forwards to `{baseURL}{path}` via `urllib.request`. Client picks proxy (absolute path) vs direct (`baseURL`) by hostname check (`localhost`/`127.0.0.1`).


---
id: g-010
type: gotcha
confidence: 0.85
tags: ["build", "sse", "streaming"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## stdlib SSE streaming passthrough via urllib + wfile

stdlib SSE streaming passthrough — `urllib.request.urlopen()` then loop `read(1024)` → `wfile.write()` + `wfile.flush()`. `urllib.error.HTTPError` is itself readable, so forward upstream error status + `.read()` body verbatim.


## Patterns That Worked
<!-- Reusable patterns discovered across features -->

---
id: p-001
type: pattern
confidence: 0.9
tags: ["skills", "eval", "testing"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Skill Creator eval workflow — parallel subagents + grading + mkviewer

Parallel subagents (with + without skill) → grading script → mkviewer. Catches structural issues immediately. Without-skill baselines prove the skill's value quantitatively.


---
id: p-002
type: pattern
confidence: 0.9
tags: ["skills", "output", "schema"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Schema-first skill output — provide exact JSON Schema as output contract

Provide an exact JSON Schema as output contract. Dramatically improves consistency and makes automated grading possible.


---
id: p-003
type: pattern
confidence: 0.9
tags: ["skills", "eval", "testing"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Skill eval grading scripts — reusable grade.py with jsonschema + assertions

Write a reusable `grade.py` that combines jsonschema validation with assertion-specific checks. Can be used across iterations.


---
id: p-004
type: pattern
confidence: 1.0
tags: ["architecture", "llm", "config"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Config-driven provider pattern — single JSON config controls LLM backend switching

Single JSON config file controls LLM type, model, API parameters, and skill auto-loading. Provider factory creates the right implementation at runtime. Switching from mock to real API is a one-line config change.


---
id: p-005
type: pattern
confidence: 0.9
tags: ["llm", "sse", "streaming"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## SSE stream parsing via fetch().body.getReader() — no SDK needed

No SDK needed. Both OpenAI (`data:` lines + `[DONE]`) and Anthropic (`event:`/`data:` lines + `message_stop`) SSE formats can be parsed with the same reader pattern, isolating protocol differences in each provider class.


---
id: p-006
type: pattern
confidence: 0.85
tags: ["ui", "markdown", "parsing"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Zero-dependency markdown parser — 4-stage pipeline for chat content

Four-stage pipeline: HTML-escape → code block isolation → paragraph/list block parsing → inline markdown replacement. Covers 90%+ of chat content with zero npm dependencies. Usable in both TypeScript modules and inline `<script>`.


---
id: p-007
type: pattern
confidence: 0.85
tags: ["ui", "ux", "clipboard"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Copy-to-clipboard UX — navigator.clipboard.writeText() + visual feedback

`navigator.clipboard.writeText()` + brief visual feedback ("Copied!" for 1.5s). Graceful fallback if clipboard API unavailable. Works in all modern browsers in secure contexts.


---
id: p-008
type: pattern
confidence: 1.0
tags: ["index", "search", "perf"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Pre-built inverted index for local search — build-index.py + lazy fetch

`build-index.py` walks knowledge directory, parses markdown sections, tokenizes, builds JSON index. Browser fetches index at startup, searches in-memory with <50ms latency. Index stores only metadata + 200-char previews — full content fetched lazily.


---
id: p-009
type: pattern
confidence: 1.0
tags: ["portability", "architecture"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## agent/ portability pattern — skills + knowledge + memory, platform-agnostic

`agent/` = skills + knowledge + memory (platform-agnostic). `ui_lite/` = optional browser UI. `serve.py` = optional local server. Clean separation enables deployment to AgentScope, custom platforms, etc. without carrying UI code.


---
id: p-010
type: pattern
confidence: 0.9
tags: ["skills", "knowledge", "prompting"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Anti-fabrication via context constraint — inject knowledge chunks, enforce citations

Inject knowledge chunks as `[Knowledge: source#section]` system messages. Skill instructions enforce "only answer from [Knowledge] blocks, cite sources, confidence score." Multiple layers prevent fabrication.


## Architecture Decisions
<!-- ADRs made during spec-driven development -->

---
id: d-001
type: decision
confidence: 0.9
tags: ["architecture"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-001: Specs per feature in features/<feature>/specs/

Specs per feature in features/<feature>/specs/. specs/SDD.md and specs/_template/ are project-wide scaffolding.


---
id: d-002
type: decision
confidence: 0.9
tags: ["architecture"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-002: Modular LLM backends with config-driven provider switching

Modular LLM backends with config-driven provider switching. Both OpenAI-compatible and Anthropic APIs supported via plain fetch(). UI swaps between mock and real LLM at config level.


---
id: d-003
type: decision
confidence: 0.9
tags: ["skills"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-004: Skills live in features/<feature>/skill/

Skills live in features/<feature>/skill/. Each skill follows Skill Creator workflow: draft → eval → iterate. Skills are loaded by the remote LLM through the LlmProvider interface.


---
id: d-004
type: decision
confidence: 0.9
tags: ["api"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-005: MCP/API configurations for skills use placeholders in references/config.md

MCP/API configurations for skills use placeholders in references/config.md. No hardcoded endpoints. Deployers replace placeholders with real values.


---
id: d-005
type: decision
confidence: 0.9
tags: ["config"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-006: Project-level LLM configuration in ake.json at project root (gitignored), with ake.example.json as committed template

Project-level LLM configuration in ake.json at project root (gitignored), with ake.example.json as committed template. Served to the browser by serve.py via explicit /ake.json endpoint. Uses provider factory pattern to create the right backend at runtime without code changes.


---
id: d-006
type: decision
confidence: 0.9
tags: ["api"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-007: Zero-SDK-dependency API integration

Zero-SDK-dependency API integration. Both OpenAI and Anthropic APIs are accessed via plain fetch(), avoiding npm packages like @anthropic-ai/sdk and openai. SSE stream parsing is handled manually per protocol.


---
id: d-007
type: decision
confidence: 0.9
tags: ["architecture"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-008: agent/ is platform-agnostic core

agent/ is platform-agnostic core. ui_lite/, serve.py, config/ are local-dev only. Each feature's agent/ can be deployed independently.


---
id: d-008
type: decision
confidence: 0.9
tags: ["perf"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-009: Pre-built inverted index (build-index.py) over runtime search

Pre-built inverted index (build-index.py) over runtime search. Browser loads index JSON, searches in-memory, fetches relevant knowledge files lazily.


---
id: d-009
type: decision
confidence: 0.9
tags: ["memory"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-010: Knowledge sources are read-only

Knowledge sources are read-only. All learning from conversations goes into MEMORY, which evolves separately from the sources.


---
id: d-010
type: decision
confidence: 0.9
tags: ["skills"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-011: Multi-skill architecture with orchestrator pattern

Multi-skill architecture with orchestrator pattern. Sub-skills are loaded as system messages; the LLM switches modes implicitly based on conversation state.


---
id: d-011
type: decision
confidence: 0.9
tags: ["data"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-012: localStorage for session memory, persistent.json for durable memory

localStorage for session memory, persistent.json for durable memory. Fast, zero-dependency, exportable.


---
id: d-012
type: decision
confidence: 0.9
tags: ["conventions"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## ADR-013: Chinese for skills/UI labels, English for code/schemas/JSON keys

Chinese for skills/UI labels, English for code/schemas/JSON keys. Follows project convention from 002-project-initializer-skill.


## Facts
<!-- Ownership, dependencies, constraints, and other durable facts about the project -->

---
id: f-001
type: fact
confidence: 0.9
tags: ["ownership", "init-chat"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: init-chat skill

**Files**: features/init-chat/skill/project-initializer/SKILL.md
**Touched by**: 002-project-initializer-skill
**Why**: Main skill: 7-phase conversation flow


---
id: f-002
type: fact
confidence: 0.9
tags: ["ownership", "init-chat"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: init-chat skill

**Files**: features/init-chat/skill/project-initializer/references/*
**Touched by**: 002-project-initializer-skill
**Why**: Field definitions, config, schemas


---
id: f-003
type: fact
confidence: 0.9
tags: ["ownership", "init-chat"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: init-chat UI

**Files**: features/init-chat/ui_lite/index.html
**Touched by**: 001-chat-ui, 003-llm-api-config, 004-chat-markdown-copy, 006-serve-llm-proxy
**Why**: Zero-dependency chat UI with proxy support


---
id: f-004
type: fact
confidence: 0.9
tags: ["ownership", "init-chat"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: init-chat server

**Files**: features/init-chat/serve.py
**Touched by**: 003-llm-api-config, 006-serve-llm-proxy
**Why**: Dev server: serves ake.json (key redacted), proxies LLM calls, CORS


---
id: f-005
type: fact
confidence: 0.9
tags: ["ownership", "qna"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: qna build

**Files**: features/qna-agent/build-index.py
**Touched by**: 005-qna-agent
**Why**: Inverted index builder (Python stdlib)


---
id: f-006
type: fact
confidence: 0.9
tags: ["ownership", "qna"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: qna server

**Files**: features/qna-agent/serve.py
**Touched by**: 005-qna-agent, 007-qna-serve-llm-proxy
**Why**: HTTP server: proxies LLM calls, CORS, redacts key


---
id: f-007
type: fact
confidence: 0.9
tags: ["ownership", "qna"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: qna UI

**Files**: features/qna-agent/ui_lite/index.html
**Touched by**: 005-qna-agent, 007-qna-serve-llm-proxy
**Why**: Browser Q&A UI with sidebar + search


---
id: f-008
type: fact
confidence: 0.9
tags: ["ownership", "qna"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: qna skills

**Files**: features/qna-agent/agent/skill/*/SKILL.md
**Touched by**: 005-qna-agent
**Why**: Multi-skill architecture (orchestrator, retrieval, curation)


---
id: f-009
type: fact
confidence: 0.9
tags: ["ownership", "qna"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: qna memory

**Files**: features/qna-agent/agent/memory/persistent.json
**Touched by**: 005-qna-agent
**Why**: Self-evolving agent memory


---
id: f-010
type: fact
confidence: 0.9
tags: ["ownership", "qna"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## Code ownership: qna config

**Files**: features/qna-agent/agent/knowledge-sources.json
**Touched by**: 005-qna-agent
**Why**: Portable knowledge source config


---
id: f-011
type: fact
confidence: 1.0
tags: ["workflow", "sdd"]
source: "memory-init-2026-07-03"
recurrence_count: 1
---
## AI Workflow Rule — spec writing prerequisites and post-feature steps

Before writing any spec, read in order: 1) AGENTS.md, 2) specs/SDD.md, 3) knowledge/index.md, 4) MEMORY.md, 5) specs/index.md. After shipping a feature: write takeaways.md, curate findings into MEMORY.md (tagged, ⚡ for critical), update code ownership map.


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
