# Q&A Serve LLM Proxy — Takeaways

## What Went Well
- The 006 proxy pattern ported cleanly; only the config path (`config/ake.json`
  under `SCRIPT_DIR`) and the extra `do_PUT`/OPTIONS methods needed adapting.
- Reused the isolated mock-upstream smoke test (added a `do_PUT` regression
  check) — 10/10 passed without a real key.

## What We Learned
- qna-agent served `/ake.json` through a generic `_serve_file`, so redaction had
  to be scoped to a dedicated `_serve_ake_json` rather than the shared helper —
  otherwise redaction logic would risk leaking into other file responses.
- Removing the now-unused `_serve_file` avoided dead code; `CONTENT_TYPES` was
  left in place to stay consistent with init-chat's serve.py.

## API / Tech Surprises
- `end_headers()` override composes fine with the existing `do_PUT`/`do_GET`
  handlers — CORS now covers PUT responses too, for free.

## Patterns Worth Reusing
- Same server-side proxy + key-redaction pattern as 006; when a server already
  has custom verb handlers, put CORS in `end_headers()` so every verb inherits it.
