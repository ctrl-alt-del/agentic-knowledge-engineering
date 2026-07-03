---
feature_id: "006"
name: "Serve LLM Proxy"
status: "✅ Done"
depends_on: ["003-llm-api-config"]
touches:
  - "features/init-chat/serve.py"
  - "features/init-chat/ui_lite/index.html"
  - "MEMORY.md"
  - "specs/index.md"
created: "2026-07-03"
---

# Serve LLM Proxy — Plan

## Approach

1. **CORS everywhere**: override `end_headers()` in the handler to inject CORS
   headers on every response, and extend `do_OPTIONS` to allow `POST`.
2. **Server-side proxy**: add `do_POST` that only handles `/chat/completions`
   and `/messages`, reads `baseURL`/`apiKey` from the on-disk `ake.json`, sets
   the correct auth header per endpoint, forwards the body via `urllib.request`,
   and streams the SSE response back chunk-by-chunk.
3. **Key redaction**: in `_serve_ake_json`, replace a real `llm.apiKey` with the
   sentinel `"configured"` before serving so the browser never receives the key
   but still detects a configured provider.
4. **Client transport**: add `proxyUrl(cfg, apiPath)` that returns an absolute
   path on localhost (→ proxy) or the direct `baseURL` URL otherwise; wire it
   into `streamOpenAI` and `streamAnthropic`.

One task = one commit (both files + docs together, per user request).

## Files to Create / Change

| Action | File | Rationale |
|--------|------|-----------|
| Change | `features/init-chat/serve.py` | CORS override, key redaction, `do_POST` proxy |
| Change | `features/init-chat/ui_lite/index.html` | `proxyUrl()` helper + wiring |
| Change | `MEMORY.md` | Promote security/build learnings, resolve 003 CORS risk |
| Change | `specs/index.md` | Add feature 006 row |

## Risks

- **Streaming buffering**: `urllib` must be read/written in chunks and flushed,
  or SSE will appear all-at-once. Mitigation: read in a loop, `wfile.flush()`.
- **Redaction breaks connected-check**: stripping `apiKey` could drop the UI to
  Mock. Mitigation: substitute a non-placeholder sentinel `"configured"`.
- **Key leak via logs**: mitigate by never logging body/headers/key.

## Dependencies

- 003-llm-api-config: `ake.json` schema (`llm.baseURL`, `llm.apiKey`,
  `llm.provider`), the `/ake.json` endpoint, and the SSE parsing in the UI.
