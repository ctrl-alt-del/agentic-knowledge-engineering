# Serve LLM Proxy — Specification

## User Story
As a developer running the init-chat UI locally, I want the dev server to proxy
LLM API calls (and keep my API key server-side) so that I can chat against a
real provider without hitting browser CORS errors and without exposing my key
to the browser.

## UX/UI
- No visual change. Back-end (`serve.py`) + JS transport change only.
- Connection status indicator continues to show "connected" when a real key is
  configured (validated via a redacted, non-placeholder marker).

## Behavior Contract

### Proxy endpoints (`serve.py`, local dev)
- `POST /chat/completions` → forwards to `{baseURL}/chat/completions` with
  `Authorization: Bearer {apiKey}`.
- `POST /messages` → forwards to `{baseURL}/messages` with `x-api-key: {apiKey}`
  and `anthropic-version: 2023-06-01`.
- Request body is forwarded verbatim; the streaming (SSE) response is passed
  through chunk-by-chunk with the upstream `Content-Type`.
- `baseURL` and `apiKey` are read from the real `ake.json` on disk at request
  time. They are never logged.

### CORS
- All responses (GET, POST, OPTIONS) carry `Access-Control-Allow-Origin: *` and
  permissive `Access-Control-Allow-Headers`, injected via an `end_headers()`
  override.

### Client transport (`ui_lite/index.html`)
- `proxyUrl(cfg, apiPath)` returns an absolute path (e.g. `/chat/completions`)
  when the page is served from `localhost`/`127.0.0.1` (→ hits the serve.py
  proxy), otherwise returns `{cfg.baseURL}{apiPath}` (remote deployment falls
  back to calling the provider directly).

### Key redaction (`GET /ake.json`)
- When served by `serve.py`, `llm.apiKey` is replaced with the sentinel
  `"configured"` if a real key is present, so the browser's connected-check
  passes but the real key never leaves the server.

## Acceptance Criteria

### Happy Path
- [ ] Given a valid `ake.json`, when the page (on 127.0.0.1) sends a message,
      then the request goes to `/chat/completions` (or `/messages`) and the
      streamed reply renders incrementally.
- [ ] Given a real key in `ake.json`, when the browser fetches `/ake.json`,
      then `llm.apiKey` is `"configured"` (not the real key) and status shows
      connected.
- [ ] Given any request, when the response is sent, then it includes
      `Access-Control-Allow-Origin: *`.

### Edge Cases
- [ ] When `ake.json` is missing or `apiKey`/`baseURL` is a placeholder/empty,
      then `POST /chat/completions` returns a `502` with a clear message (no key
      logged), and `/ake.json` is served unmodified (browser falls back to Mock).
- [ ] When the upstream API returns an error status, then that status/body is
      forwarded to the browser.
- [ ] When `POST` targets a path other than the two endpoints, then `404`.
- [ ] When the page is served from a non-localhost host, then `proxyUrl()`
      returns the direct `baseURL` URL (no proxy).

## Non-Functional Requirements
- Security: keep default bind `127.0.0.1`; keep `/config/`, `/.git/`,
  `/ake.json/` blocks; never log or serve the real API key to the browser.
- Dependencies: Python stdlib only (`http.server`, `urllib.request`, `json`).
- Streaming: SSE passthrough must not buffer the full response.
