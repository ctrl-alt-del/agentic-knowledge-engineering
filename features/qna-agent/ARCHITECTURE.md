# Q&A Agent — Architecture

## Overview

离线知识库问答 agent。基于知识源（正向文档、代码逆向、胶囊日志）进行推理，不编造内容。
采用多技能架构（orchestrator + retrieval + memory-curation），预构建倒排索引实现高效检索，
read-only 知识源 + 自演化 MEMORY 分离。

## Folder Structure

```
features/qna-agent/
├── agent/                      # ☆ Portable agent core
│   ├── skill/                  # Skills (loaded by LLM runtime)
│   │   ├── qna-orchestrator/   # Main routing + conversation
│   │   ├── knowledge-retrieval/# Search + index strategy
│   │   └── memory-curation/    # Memory life cycle
│   ├── knowledge/              # Read-only knowledge sources
│   │   ├── forward/  reverse/  capsule/
│   ├── knowledge-index.json    # Auto-generated inverted index
│   ├── memory/persistent.json  # Distilled persistent memory
│   └── knowledge-sources.json  # Source config (editable in UI)
│
├── ui_lite/                    # Local browser UI (one possible UI)
│   └── index.html              # SPA: sidebar + chat + search + memory
│
├── serve.py                    # Local dev server (127.0.0.1, path-filtered)
├── build-index.py              # Index builder (Python stdlib only)
│
├── config/                     # Local dev LLM config
│   ├── ake.example.json
│   └── ake.json
│
└── specs/005-qna-agent/        # Feature specs
```

### What's Portable vs Local

| Path | Portable? | Purpose |
|------|-----------|---------|
| `agent/` | **Yes** | Agent core — skills, knowledge, memory, config. Copy to any platform. |
| `build-index.py` | **Yes** | Pre-build index before deploying agent/knowledge/ |
| `ui_lite/` | No | Browser UI — one of many possible UIs |
| `serve.py` | No | Local dev server — one of many possible servers |
| `config/` | No | Local LLM credentials — platform manages its own |

## Deployment Paths

### Local Development

```bash
cd features/qna-agent/
cp config/ake.example.json config/ake.json    # Edit with your LLM credentials
python3 build-index.py                         # Build initial index
python3 serve.py                               # Start server (http://127.0.0.1:3100)
# Open http://127.0.0.1:3100/ui_lite/
```

### Platform Deployment (AgentScope, custom server, etc.)

```bash
# Copy agent core + index builder
cp -r features/qna-agent/agent/ /target/platform/agent/
cp features/qna-agent/build-index.py /target/platform/

# Build index
cd /target/platform/
python3 build-index.py agent/knowledge/

# Platform loads:
#   agent/skill/ → skill definitions
#   agent/knowledge-index.json → search index
#   agent/memory/persistent.json → agent memory
#   agent/knowledge-sources.json → source config
```

### Custom Python Server

```bash
# Use serve.py as baseline, customize as needed
python3 features/qna-agent/serve.py --port 8080 --bind 0.0.0.0

# Or serve agent/ as a static directory with Nginx:
#   nginx: location /agent/ { alias /path/to/agent/; }
#   The agent core has no runtime — it's loaded by the LLM platform
```

## Skill Architecture

```
User → Browser → Knowledge Search → Context Injection → LLM
                                                          │
                    ┌─────────────────────────────────────┘
                    ▼
        ┌───────────────────────┐
        │  qna-orchestrator      │  ← Always loaded
        │  Routes between modes  │
        └───────┬───────────────┘
                │
        ┌───────┴───────────────┐
        ▼                       ▼
┌──────────────┐       ┌──────────────┐
│ knowledge-   │       │ memory-      │
│ retrieval    │       │ curation     │
│ Search +     │       │ Lifecycle    │
│ relevance    │       │ Add/Condense │
└──────────────┘       └──────────────┘
```

### Skill Interaction

1. **orchestrator** receives the user query + pre-selected `[Knowledge]` blocks
2. **knowledge-retrieval** instructions tell the LLM how to interpret and prioritize those blocks
3. **memory-curation** instructions tell the LLM when/how to mark learnings for persistent memory
4. The orchestrator switches between modes implicitly based on conversation state (see `skill-router.md`)

All three skills are loaded as system messages. The LLM doesn't "call" them — it uses their instructions to guide behavior.

## Index System

### build-index.py

1. Walks `agent/knowledge/` recursively for `.md` and `.markdown` files
2. Parses `## headers` as sections
3. Tokenizes content (lowercase, whitespace-split, CJK bigrams)
4. Builds inverted index: token → [{source, section, tf_score}]
5. Stores 200-char previews per section
6. Detects changes via file set comparison + mtimes

### Browser Search (ui_lite/index.html)

1. Tokenize user query
2. Look up each token in inverted index
3. Aggregate TF scores per source-section pair
4. Return top-K (default 5) most relevant chunks
5. Inject as `[Knowledge: source#section]` system messages

### Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Index build (100 files) | <2s | Python stdlib, single-pass |
| Index JSON size | <5% of knowledge size | Only metadata + 200-char previews |
| Browser search | <50ms | In-memory inverted index |
| UI startup | <500ms | Index JSON fetch + skill loads |

## Memory System

### Architecture

```
Session (localStorage: qna-memory)
  ├── entries: [{id, type, tags, content, sources, confidence, ...}]
  └── lastDistill: timestamp

Lifecycle:
  Add → Condense → Forget ─┐
     ↑                    ↓
     └── Update ←─────────┘
```

### Trigger Conditions

| Action | Trigger |
|--------|---------|
| Add | New learning discovered in conversation |
| Condense | ≥2 entries with >70% token overlap |
| Forget | stale + low access_count + age > 30 days |
| Update | New info contradicts existing (high confidence) |
| Strengthen | Entry re-confirmed in conversation |

### Storage

- **Session**: Browser `localStorage` (survives tab close, limited to ~5-10MB)
- **Export**: `⬇ 导出` button downloads `persistent.json`
- **Platform integration**: Platform can read/write `agent/memory/persistent.json` directly

## Security

- `serve.py` binds `127.0.0.1` by default (localhost only)
- `/config/` directory blocked from direct HTTP access
- `ake.json` served via `/ake.json` endpoint (not `/config/ake.json`)
- `python3 -m http.server` alternative: must use `--bind 127.0.0.1`
- All config writes debounced; `PUT` endpoints validate JSON
- CORS headers set for cross-origin PUT requests

## Language Policy

| Context | Language | Rationale |
|---------|----------|-----------|
| Skills (SKILL.md) | 简体中文 | Domain concepts clearer, project convention |
| UI labels | 简体中文 | User-facing text |
| Code (Python, JS) | English | Industry standard |
| Schemas, JSON keys | English | Interoperable, universal |
| Architecture docs | English | Project convention |

## Design Decisions

- **ADR-008**: `agent/` is platform-agnostic core; `ui_lite/`, `serve.py`, `config/` are local dev only
- **ADR-009**: Pre-built inverted index over runtime search — faster, independent of source's own index
- **ADR-010**: Knowledge sources are read-only; all learning happens in MEMORY
- **ADR-011**: Multi-skill architecture with orchestrator — enables future specialization
- **ADR-012**: localStorage for session memory, persistent.json for durable — fast, zero-dependency
- **ADR-013**: Chinese for skills/UI, English for code/schemas — project convention

## Dependencies

- Python 3 stdlib (`build-index.py`, `serve.py`)
- Browser with `localStorage`, `fetch`, `Web APIs`
- Zero npm, zero pip, zero external packages
