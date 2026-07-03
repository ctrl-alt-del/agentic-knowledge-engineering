# Serve LLM Proxy — Takeaways

## What Went Well
- Single-file stdlib proxy (`urllib.request`) with chunked read/`wfile.flush()`
  gives true SSE passthrough — no buffering, no SDK.
- Overriding `end_headers()` is the cleanest way to guarantee CORS on *every*
  response (static, JSON, proxy, errors) instead of per-handler headers.
- Isolated smoke test (mock upstream echoing the injected auth header + a
  backed-up/restored `ake.json`) verified all paths without touching the real
  key or leaking it.

## What We Learned
- Redacting `llm.apiKey` to a sentinel (`"configured"`) keeps the browser's
  connected-check happy while ensuring the real key never leaves the server.
  Stripping the field entirely would have silently dropped the UI to Mock.
- The proxy resolves the CORS risk logged in 003-llm-api-config's plan.

## API / Tech Surprises
- `urllib.error.HTTPError` is itself a readable response — reading `.read()`
  lets us forward the upstream error status + body verbatim.

## Patterns Worth Reusing
- Server-side API proxy for local dev: hides secrets from the browser and
  bypasses CORS in one move; client picks proxy vs direct via a hostname check.
- stdlib SSE streaming passthrough: `urlopen` → loop `read(1024)` → write+flush.
