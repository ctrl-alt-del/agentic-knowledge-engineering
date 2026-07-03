# Q&A Serve LLM Proxy — Test Plan

## Static / Unit
- [ ] **Syntax**: `python3 -c "import ast; ast.parse(open('serve.py').read())"`.
- [ ] **Redaction**: real key → served `/ake.json` has `apiKey == "configured"`;
      placeholder key → unchanged.

## Integration (curl, server running on 127.0.0.1:3199)

### CORS
- [ ] **GET has CORS**: `GET /ui_lite/index.html` → `Access-Control-Allow-Origin: *`.
- [ ] **OPTIONS**: `OPTIONS /chat/completions` → `200` + CORS + POST allowed.

### Proxy
- [ ] **OpenAI happy path**: `POST /chat/completions` → upstream SSE streamed;
      `Authorization: Bearer <key>` injected.
- [ ] **Anthropic happy path**: `POST /messages` → streamed; `x-api-key` injected.
- [ ] **Missing/placeholder config**: `POST /chat/completions` → `502`, no key logged.
- [ ] **Unknown POST path**: `POST /foo` → `404`.
- [ ] **Upstream error passthrough**: upstream error status/body forwarded.

### Regression
- [ ] **do_PUT still works**: `PUT /knowledge-sources.json` → `{ "ok": true }`.

## UI (browser, 127.0.0.1:3100/ui_lite/)
- [ ] Network shows request to `/chat/completions` (relative), not `baseURL`.
- [ ] Assistant reply streams incrementally.
- [ ] `GET /ake.json` shows `apiKey: "configured"`.

## Edge / Boundary
- [ ] Non-localhost host → `proxyUrl()` returns direct `baseURL` URL.
- [ ] `baseURL` with trailing slash → no double slash in target URL.
