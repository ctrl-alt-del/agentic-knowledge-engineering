# Serve LLM Proxy — Test Plan

## Static / Unit
- [ ] **Syntax**: `python3 -c "import ast; ast.parse(open('serve.py').read())"`
      parses without error.
- [ ] **Redaction**: given `ake.json` with a real key, `_serve_ake_json`
      output has `llm.apiKey == "configured"`; given a placeholder key, output
      is unchanged.

## Integration (curl, server running on 127.0.0.1:3000)

### CORS
- [ ] **GET has CORS**: `curl -si /ui_lite/index.html` → response includes
      `Access-Control-Allow-Origin: *`.
- [ ] **OPTIONS**: `curl -si -X OPTIONS /chat/completions` → `200` + CORS + POST
      in allowed methods.

### Proxy
- [ ] **OpenAI happy path**: `POST /chat/completions` with a valid body →
      upstream reply streamed back (Arrange: valid `ake.json`; Act: curl; Assert:
      SSE `data:` chunks received).
- [ ] **Anthropic happy path**: `POST /messages` → streamed `content_block_delta`.
- [ ] **Missing/placeholder config**: `POST /chat/completions` with placeholder
      `ake.json` → `502` clear message, no key in output/logs.
- [ ] **Unknown POST path**: `POST /foo` → `404`.
- [ ] **Upstream error passthrough**: bad model → upstream error status/body
      forwarded.

## UI (browser, 127.0.0.1:3000/ui_lite/)
- [ ] **proxyUrl on localhost**: network tab shows request to `/chat/completions`
      (relative), not `baseURL`.
- [ ] **Streaming render**: assistant reply appears incrementally.
- [ ] **Key hidden**: `GET /ake.json` response shows `apiKey: "configured"`.

## Edge / Boundary
- [ ] Non-localhost host → `proxyUrl()` returns direct `baseURL` URL
      (verified by reading the helper logic / hostname branch).
- [ ] `baseURL` with trailing slash → no double slash in target URL.
