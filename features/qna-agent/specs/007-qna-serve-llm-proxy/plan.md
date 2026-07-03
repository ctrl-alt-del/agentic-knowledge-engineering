---
feature_id: "007"
name: "Q&A Serve LLM Proxy"
status: "✅ Done"
depends_on: ["005-qna-agent", "006-serve-llm-proxy"]
touches:
  - "features/qna-agent/serve.py"
  - "features/qna-agent/ui_lite/index.html"
  - "MEMORY.md"
  - "specs/index.md"
created: "2026-07-03"
---

# Q&A Serve LLM Proxy — Plan

## Approach

Port the 006-serve-llm-proxy pattern to qna-agent, adapting for its differences:
`ake.json` lives at `config/ake.json` (under `SCRIPT_DIR`), and the server
already has `do_PUT` + `do_OPTIONS`.

1. **CORS everywhere**: override `end_headers()` to inject CORS on all responses;
   drop the now-redundant CORS lines from `do_OPTIONS` and set methods to
   `GET, POST, PUT, OPTIONS`.
2. **Server-side proxy**: add `do_POST` handling only `/chat/completions` and
   `/messages`; read `baseURL`/`apiKey` from `config/ake.json`; set the correct
   auth header per endpoint; forward the body via `urllib.request`; stream the
   SSE response back chunk-by-chunk.
3. **Key redaction**: redact `llm.apiKey` → `"configured"` only on the
   `/ake.json` GET path (which serves `config/ake.json`).
4. **Client transport**: add `proxyUrl(cfg, apiPath)`; wire into `streamOpenAI`
   and `streamAnthropic`.

One task = one commit (both files + docs together, per user request).

## Files to Create / Change

| Action | File | Rationale |
|--------|------|-----------|
| Change | `features/qna-agent/serve.py` | CORS override, key redaction, `do_POST` proxy |
| Change | `features/qna-agent/ui_lite/index.html` | `proxyUrl()` helper + wiring |
| Change | `MEMORY.md` | Ownership map += 007 (pattern reused from 006) |
| Change | `specs/index.md` | Add feature 007 row |

## Risks

- **Streaming buffering**: read/write in chunks + `wfile.flush()` or SSE arrives
  all-at-once.
- **Generic `_serve_file`**: redaction must be scoped to `/ake.json` only, not
  applied to every served file.
- **Redaction vs connected-check**: use sentinel `"configured"`, not empty/removed.

## Dependencies

- 005-qna-agent: `config/ake.json`, `/ake.json` endpoint, `do_PUT`, UI SSE parsing.
- 006-serve-llm-proxy: the proxy + redaction pattern being ported.
