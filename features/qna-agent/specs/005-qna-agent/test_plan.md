# Q&A Knowledge Agent — Test Plan

## Unit Tests

### build-index.py
- [ ] **Happy path**: Given a knowledge/ dir with markdown files, when run, then generates knowledge-index.json with valid structure
- [ ] **Empty dir**: Given empty knowledge/ dirs, when run, then generates index with empty inverted dict and no errors
- [ ] **Change detection**: Given unchanged knowledge files, when run again, then skips rebuild (outputs "No changes detected")
- [ ] **Change detection**: Given a modified file, when run, then rebuilds index
- [ ] **Non-md files**: Given .txt/.json files mixed in, when run, then skips non-.md and continues
- [ ] **Section parsing**: Given markdown with ## headers, when parsed, then correctly extracts sections and their tokens
- [ ] **Tokenization**: Given mixed Chinese/English content, when tokenized, then produces lowercase tokens, split on whitespace

### serve.py
- [ ] **Happy path**: Given server running, when GET /ui_lite/, then returns 200
- [ ] **Block /config/**: Given server running, when GET /config/ake.json, then returns 403
- [ ] **Serve /ake.json**: Given config/ake.json exists, when GET /ake.json, then returns content with correct Content-Type
- [ ] **Serve skills**: Given agent/skill/ exists, when GET /skill/qna-orchestrator/SKILL.md, then returns 200
- [ ] **Serve knowledge**: Given agent/knowledge/ has files, when GET /knowledge/forward/test.md, then returns 200
- [ ] **PUT config**: Given a JSON body, when PUT /knowledge-sources.json, then writes to file and returns 200
- [ ] **PUT memory**: Given a JSON body, when PUT /memory/persistent.json, then writes to file and returns 200

### ui_lite/index.html (manual / webapp-testing)
- [ ] **Sidebar renders**: Knowledge sources visible with green/yellow dots
- [ ] **Chat send**: User types message, sends, receives streaming response
- [ ] **Source citations**: Assistant messages show [Source: file#section] tags
- [ ] **Confidence display**: Assistant messages show 置信度 label
- [ ] **Add source**: Click "+ 添加知识源", form opens, saves to config
- [ ] **Memory panel**: Shows entry count, last distillation time
- [ ] **Distill button**: Triggers memory curation flow
- [ ] **Export button**: Downloads persistent.json
- [ ] **Mock fallback**: When LLM API unavailable, falls back to mock responses
- [ ] **Search priority**: Switch priority modes, search behavior changes

## Integration
- [ ] **E2E flow**: Start serve.py → open browser → ask question → get cited answer → distill memory
- [ ] **Index refresh**: Add new knowledge file → run build-index.py → reload → new content searchable
- [ ] **Portability**: Copy agent/ + build-index.py to temp dir → run → index generated → agent core functional

## Edge Cases
- [ ] Empty knowledge source → shows empty state with "添加知识源" prompt
- [ ] Very long knowledge file (>10K lines) → index truncated, no crash
- [ ] Non-existent knowledge file in config → skips, shows warning in index log
- [ ] localStorage full → shows warning, offers export
- [ ] Multiple concurrent saves to persistent.json → debounced, last write wins
- [ ] Chinese tokenization → handles CJK characters correctly in index
