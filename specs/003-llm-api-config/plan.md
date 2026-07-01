---
feature_id: "003"
name: "LLM API 配置"
status: "✅ Done"
depends_on: ["001-chat-ui", "002-project-initializer-skill"]
touches:
  - "ake.example.json"
  - "ake.schema.json"
  - ".gitignore"
  - "ui/src/lib/config.ts"
  - "ui/src/lib/config.test.ts"
  - "ui/src/lib/llmProvider.ts"
  - "ui/src/lib/types.ts"
  - "ui/src/lib/mockResponder.ts"
  - "ui/src/lib/mockResponder.test.ts"
  - "ui/src/lib/openAiProvider.ts"
  - "ui/src/lib/openAiProvider.test.ts"
  - "ui/src/lib/anthropicProvider.ts"
  - "ui/src/lib/anthropicProvider.test.ts"
  - "ui/src/lib/skillLoader.ts"
  - "ui/src/lib/skillLoader.test.ts"
  - "ui/src/components/MessageBubble.vue"
  - "ui/src/components/ChatContainer.vue"
  - "ui/src/components/ChatContainer.test.ts"
  - "ui/src/components/ConfigStatus.vue"
  - "ui/src/components/ConfigStatus.test.ts"
  - "ui/src/App.vue"
  - "MEMORY.md"
  - "specs/index.md"
  - "README.md"
  - "AGENTS.md"
created: "2026-07-01"
---

# LLM API 配置 — 计划

## 方案

1. **配置格式**：参考 OpenCode 的 `opencode.json`，设计简化的 `ake.json` 格式
2. **Provider 抽象**：现有 `LlmProvider` 接口已支持多实现，新增 `OpenAiProvider` 和 `AnthropicProvider`
3. **接口升级**：`sendMessage` 从 `(content: string)` 改为 `(messages: Message[])`，新增可选的 `sendMessageStream`
4. **配置驱动**：`App.vue` 启动时读取 `ake.json` → 创建 provider → 加载技能 → 渲染 ChatContainer
5. **安全降级**：配置缺失 → MockResponder，API 失败 → 错误消息不崩溃
6. **流式输出**：两种 provider 分别解析各自 SSE 格式，通过 `onChunk` 回调增量更新 UI

## 文件创建 / 变更

| 操作 | 文件 | 原因 |
|------|------|------|
| 创建 | `ake.example.json` | 配置模板 |
| 创建 | `ake.schema.json` | 配置 JSON Schema |
| 变更 | `.gitignore` | 添加 `ake.json` |
| 创建 | `ui/src/lib/config.ts` | 配置加载器和类型 |
| 变更 | `ui/src/lib/llmProvider.ts` | 接口升级（messages + streaming） |
| 变更 | `ui/src/lib/types.ts` | Message.role 增加 "system" |
| 变更 | `ui/src/lib/mockResponder.ts` | 适配新接口 |
| 创建 | `ui/src/lib/openAiProvider.ts` | OpenAI 兼容 provider |
| 创建 | `ui/src/lib/anthropicProvider.ts` | Anthropic provider |
| 创建 | `ui/src/lib/skillLoader.ts` | 技能加载器 |
| 创建 | `ui/src/components/ConfigStatus.vue` | 连接状态指示器 |
| 变更 | `ui/src/components/ChatContainer.vue` | 适配新接口 + 流式支持 |
| 变更 | `ui/src/App.vue` | 配置驱动 provider 创建 |

## 风险

- **CORS**：浏览器端 `fetch()` 直接调用 LLM API 会遇到跨域限制。缓解：Vite dev proxy 或用户通过自己的代理转发。当前使用占位符，非阻塞。
- **接口变更影响面**：`llmProvider.ts` 接口变更会影响 MockResponder 和 ChatContainer。缓解：同一 commit 中同步更新所有受影响文件。

## 依赖

- 001-chat-ui：`LlmProvider`, `ChatContainer`, `Message` 类型
- 002-project-initializer-skill：autoload 技能
