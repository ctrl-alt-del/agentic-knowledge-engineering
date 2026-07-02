---
feature_id: "002"
name: "项目初始化助手技能"
status: "✅ Done"
depends_on: ["001-chat-ui"]
touches:
  - "skill/project-initializer/SKILL.md"
  - "skill/project-initializer/references/form-fields.md"
  - "skill/project-initializer/references/config.md"
  - "skill/project-initializer/references/output-schema.json"
  - "skill/project-initializer/assets/state-schema.json"
  - "skill/project-initializer/evals/evals.json"
  - "MEMORY.md"
  - "specs/index.md"
  - "README.md"
  - "AGENTS.md"
created: "2026-06-30"
---

# 项目初始化助手技能 — 计划

## 方案

1. **技能文件结构**：SKILL.md 作为主文件（对话流程），references/ 存放字段定义和配置，assets/ 存放状态 schema
2. **渐进加载**：LLM 先加载 SKILL.md（~200 行），需要字段详情时读取 `form-fields.md`，需要 MCP 配置时读取 `config.md`
3. **状态持久化**：每个阶段完成后写 `state.json`，中断恢复时从该文件继续
4. **输出分离**：对话过程自然，最终输出为独立的 JSON 代码块，与对话分开
5. **MCP 抽象**：所有外部调用通过 `config.md` 定义的端点，技能本身不含硬编码 URL

## 文件创建

| 操作 | 文件 | 原因 |
|------|------|------|
| 创建 | `features/init-chat/skill/project-initializer/SKILL.md` | 主技能：7 阶段对话流程 |
| 创建 | `features/init-chat/skill/project-initializer/references/form-fields.md` | 字段定义、约束、枚举 |
| 创建 | `features/init-chat/skill/project-initializer/references/config.md` | MCP/API 可配置架构 |
| 创建 | `features/init-chat/skill/project-initializer/references/output-schema.json` | 输出 JSON Schema |
| 创建 | `features/init-chat/skill/project-initializer/assets/state-schema.json` | 断点续填状态 |
| 创建 | `features/init-chat/skill/project-initializer/evals/evals.json` | 测试用例和断言 |

## 风险

- **技能描述触发精度**：目前技能只通过 SKILL.md 的 description 触发，稍后可用 Skill Creator 的描述优化工具提升触发准确度
- **MCP 未就绪**：config.md 中 MCP 端点为占位符，首次使用前需配置真实端点
- **断点续填可靠性**：依赖文件系统写 state.json，若权限不足则功能降级（跳过恢复）

## 依赖

- 001-chat-ui：Chat UI 通过 LlmProvider 调用远程 LLM，LLM 读取本技能
