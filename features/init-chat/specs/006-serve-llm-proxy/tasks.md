# Serve LLM Proxy — Tasks

## Block 0: Spec & Design (before code)
- [x] `doc-coauthoring`: spec.md + plan.md approved
- [x] mockup: N/A (back-end/JS feature)
- [x] `test_plan.md`: test scenarios documented

## Block 1: Implementation (single commit)

- [ ] **Task 1.1**: serve.py CORS + key redaction + `do_POST` proxy, and
      index.html `proxyUrl()` helper wired into streamers —
      `features/init-chat/serve.py`, `features/init-chat/ui_lite/index.html`
  - Build: `python3 -c "import ast; ast.parse(open('features/init-chat/serve.py').read())"`
  - Tests: start `python3 features/init-chat/serve.py`; curl CORS + proxy smoke
    tests; browser verification per test_plan.md
