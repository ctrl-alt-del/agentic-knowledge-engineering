# Q&A Serve LLM Proxy — Specification

## User Story
As a developer running the qna-agent UI locally, I want the dev server to proxy
LLM API calls and keep my API key server-side so that I can chat against a real
provider without browser CORS errors and without exposing my key to the browser.

## UX/UI
- No visual change. Back-end (`serve.py`) + JS transport change only.
- Connection status continues to show "connected" when a real key is configured
  (validated via a redacted, non-placeholder marker).

## Behavior Contract

### Proxy endpoints (`serve.py`, local dev)
- `POST /chat/completions` → forwards to `{baseURL}/chat/completions` with
  `Authorization: Bearer {apiKey}`.
- `POST /messages` → forwards to `{baseURL}/messages` with `x-api-key: {apiKey}`
  and `anthropic-version: 2023-06-01`.
- Body forwarded verbatim; the SSE response is streamed back chunk-by-chunk with
  the upstream `Content-Type`.
- `baseURL`/`apiKey` are read from `config/ake.json` at request time; never logged.

### CORS
- All responses (GET, POST, PUT, OPTIONS) carry `Access-Control-Allow-Origin: *`
  and permissive `Access-Control-Allow-Headers`, injected via `end_headers()`.

### Client transport (`ui_lite/index.html`)
- `proxyUrl(cfg, apiPath)` returns the absolute path (e.g. `/chat/completions`)
  when served from `localhost`/`127.0.0.1` (→ serve.py proxy), otherwise
  `{cfg.baseURL}{apiPath}` (remote fallback).

### Key redaction (`GET /ake.json`)
- When served by `serve.py`, `llm.apiKey` is replaced with `"configured"` if a
  real key is present, so the browser's connected-check passes but the real key
  never leaves the server. Applied only to the `/ake.json` path.

## Acceptance Criteria

### Happy Path
- [ ] Given a valid `config/ake.json`, when the page (127.0.0.1) sends a message,
      the request goes to `/chat/completions` (or `/messages`) and the streamed
      reply renders incrementally.
- [ ] Given a real key, `GET /ake.json` returns `llm.apiKey == "configured"` and
      status shows connected.
- [ ] Every response includes `Access-Control-Allow-Origin: *`.
- [ ] Existing `do_PUT` writes (`/knowledge-sources.json`,
      `/memory/persistent.json`) still work and carry CORS headers.

### Edge Cases
- [ ] Missing/placeholder `config/ake.json` → `POST /chat/completions` returns
      `502` with a clear message (no key logged); `/ake.json` served unmodified
      (UI falls back to Mock).
- [ ] Upstream error status/body forwarded to the browser.
- [ ] `POST` to a non-proxy path → `404`.
- [ ] Non-localhost host → `proxyUrl()` returns the direct `baseURL` URL.

## Non-Functional Requirements
- Security: keep default bind `127.0.0.1`; keep `/config/` block; never log or
  serve the real API key to the browser.
- Dependencies: Python stdlib only (`http.server`, `urllib.request`, `json`).
- Streaming: SSE passthrough must not buffer the full response.
