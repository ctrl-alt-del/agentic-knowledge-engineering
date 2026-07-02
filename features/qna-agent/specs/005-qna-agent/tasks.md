# Q&A Knowledge Agent — Tasks

## Block 0: Spec & Design
- [x] `doc-coauthoring`: spec.md + plan.md approved
- [x] `canvas-design`: mockup generated (`ux-ui/mockup.html` + `design-philosophy.md`)

## Block 1: Index + Config
- [x] **Task 1.1**: `build-index.py` — 倒排索引构建器
  - 文件: `build-index.py`, `agent/knowledge-sources.json`
  - 验证: `python3 build-index.py` 在测试数据集上生成正确的 `knowledge-index.json`
  - 验证: 文件变化检测逻辑正确

- [x] **Task 1.2**: Config files — LLM 配置 + 知识源配置
  - 文件: `config/ake.example.json`, `agent/knowledge-sources.json`
  - 验证: JSON Schema 验证

## Block 2: Skills (3 skills)
- [x] **Task 2.1**: `qna-orchestrator` — 主路由 + 对话管理
  - 文件: `agent/skill/qna-orchestrator/SKILL.md`, `references/skill-router.md`

- [x] **Task 2.2**: `knowledge-retrieval` — 搜索 + 索引策略
  - 文件: `agent/skill/knowledge-retrieval/SKILL.md`, `references/index-schema.json`, `references/search-strategies.md`

- [x] **Task 2.3**: `memory-curation` — 记忆生命周期管理
  - 文件: `agent/skill/memory-curation/SKILL.md`, `references/memory-schema.json`, `references/condensation-rules.md`

## Block 3: Server + UI
- [x] **Task 3.1**: `serve.py` — 零依赖 HTTP server
  - 文件: `serve.py`
  - 验证: `python3 serve.py` 启动，浏览器访问 ui_lite 正常

- [x] **Task 3.2**: `ui_lite/index.html` — 浏览器 SPA
  - 文件: `ui_lite/index.html`
  - 验证: sidebar 显示知识源，chat 可发送消息，memory 面板可用

## Block 4: Documentation + Ship
- [x] **Task 4.1**: `ARCHITECTURE.md` — 架构文档 + 部署指南
  - 文件: `ARCHITECTURE.md`
  - 包含: 设计概览、部署路径、可移植说明、安全说明、快速启动

- [x] **Task 4.2**: 更新项目级文档
  - 文件: `specs/index.md`, `README.md`, `AGENTS.md`
