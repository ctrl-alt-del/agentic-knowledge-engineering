# Q&A Serve LLM Proxy — Tasks

## Block 0: Spec & Design (before code)
- [x] `doc-coauthoring`: spec.md + plan.md approved
- [x] mockup: N/A (back-end/JS feature)
- [x] `test_plan.md`: test scenarios documented

## Block 1: Implementation (single commit)

- [ ] **Task 1.1**: qna-agent serve.py CORS override + key redaction on
      `/ake.json` + `do_POST` proxy, and index.html `proxyUrl()` wired into the
      streamers — `features/qna-agent/serve.py`,
      `features/qna-agent/ui_lite/index.html`
  - Build: `python3 -c "import ast; ast.parse(open('features/qna-agent/serve.py').read())"`
  - Tests: start `python3 features/qna-agent/serve.py`; curl CORS + proxy +
    do_PUT regression smoke tests; browser verification per test_plan.md
