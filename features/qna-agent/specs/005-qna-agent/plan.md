---
feature_id: "005"
name: "Q&A Knowledge Agent"
status: "✅ Done"
depends_on:
  - "001-chat-ui"      # chat UI patterns
  - "003-llm-api-config" # LLM config + streaming patterns
touches:
  - "features/qna-agent/**"
  - "specs/index.md"
  - "README.md"
  - "AGENTS.md"
created: "2026-07-02"
---

# Q&A Knowledge Agent — Plan

## Approach

构建一个离线知识库问答 agent，核心放在 `agent/` 目录（平台无关，可独立部署），本地开发用 `ui_lite/` + `serve.py` 提供浏览器 UI。采用多技能架构（3 skills：orchestrator + retrieval + memory-curation），预构建倒排索引实现高效检索，read-only 知识源 + 自演化 MEMORY 分离。

语言策略：技能/UI 用中文，代码/schema 用英文。
部署模式：agent/ + build-index.py 可独立复制到任何平台。

## Files to Create / Change

| Action | File | Rationale |
|--------|------|-----------|
| 创建 | `features/qna-agent/build-index.py` | 倒排索引构建器 (Python stdlib) |
| 创建 | `features/qna-agent/serve.py` | 零依赖 HTTP server (127.0.0.1, 路径过滤) |
| 创建 | `features/qna-agent/config/ake.example.json` | LLM 配置模板 |
| 创建 | `features/qna-agent/config/knowledge-sources.json` | 知识源配置 |
| 创建 | `features/qna-agent/agent/skill/qna-orchestrator/SKILL.md` | 主路由技能 |
| 创建 | `features/qna-agent/agent/skill/qna-orchestrator/references/skill-router.md` | 技能路由规则 |
| 创建 | `features/qna-agent/agent/skill/knowledge-retrieval/SKILL.md` | 检索技能 |
| 创建 | `features/qna-agent/agent/skill/knowledge-retrieval/references/index-schema.json` | 索引结构 |
| 创建 | `features/qna-agent/agent/skill/knowledge-retrieval/references/search-strategies.md` | 搜索策略 |
| 创建 | `features/qna-agent/agent/skill/memory-curation/SKILL.md` | 记忆管理技能 |
| 创建 | `features/qna-agent/agent/skill/memory-curation/references/memory-schema.json` | 记忆条目结构 |
| 创建 | `features/qna-agent/agent/skill/memory-curation/references/condensation-rules.md` | 生命周期规则 |
| 创建 | `features/qna-agent/agent/knowledge-sources.json` | 可移植知识源配置 |
| 创建 | `features/qna-agent/agent/memory/persistent.json` | 初始持久记忆 |
| 创建 | `features/qna-agent/ui_lite/index.html` | 浏览器 SPA (sidebar + chat) |
| 创建 | `features/qna-agent/ARCHITECTURE.md` | 架构文档 + 部署指南 |
| 更新 | `specs/index.md` | 添加 005 条目 |
| 更新 | `README.md` | 添加 qna-agent 项目结构 |
| 更新 | `AGENTS.md` | 明确 multi-feature 结构说明 |

## Architecture Decisions

- **ADR-008**: `agent/` 是平台无关核心；`ui_lite/`、`serve.py`、`config/` 仅本地开发
- **ADR-009**: 预构建倒排索引 (build-index.py) 而非运行时搜索 — 更快、更小、不依赖源自身索引
- **ADR-010**: 知识源 read-only，所有学习进 MEMORY — 清晰分离，不污染源
- **ADR-011**: 多技能 + orchestrator 模式 — 未来可扩展子技能而不改核心
- **ADR-012**: localStorage 存 session，persistent.json 存持久记忆 — 快速、零依赖、可导出
- **ADR-013**: 技能/UI 用中文，代码/schema 用英文 — 遵循项目惯例

## Risks

| Risk | Mitigation |
|------|-----------|
| `python3 -m http.server` 默认 0.0.0.0 | 文档标注 `--bind 127.0.0.1`，提供 serve.py |
| 大知识库 index JSON 过大 | 仅存元数据 + 200 字预览 |
| localStorage 5-10MB 上限 | 可配置最大条目，导出+清理按钮 |
| LLM context 窗口溢出 | 可配置 max_chunks + max_chunk_bytes |
| 索引过期 | UI 显示 "上次构建" 时间戳 |
| 并发写 persistent.json | 1s debounce，单一保存队列 |
| LLM API CORS | 复用 init-chat 已验证模式，失败回退 mock |

## Dependencies
- Python 3 stdlib (build-index.py, serve.py)
- 浏览器 (localStorage, fetch, Web APIs)
- 零 npm/pip 外部依赖
