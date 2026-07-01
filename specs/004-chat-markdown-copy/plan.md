---
feature_id: "004"
name: "Chat Markdown + Copy"
status: "✅ Done"
depends_on: ["001-chat-ui", "003-llm-api-config"]
touches:
  - "ui/src/lib/types.ts"
  - "ui/src/lib/markdown.ts"
  - "ui/src/lib/markdown.test.ts"
  - "ui/src/components/MessageBubble.vue"
  - "ui/src/components/MessageBubble.test.ts"
  - "ui/src/components/MessageList.vue"
  - "ui/src/components/MessageList.test.ts"
  - "ui/src/components/ChatContainer.vue"
  - "ui/src/components/ChatContainer.test.ts"
  - "ui/src/App.vue"
  - "ui_lite/index.html"
  - "MEMORY.md"
  - "specs/index.md"
  - "README.md"
  - "AGENTS.md"
created: "2026-07-01"
---

# Chat Markdown + Copy — 计划

## 方案

1. **Markdown 解析器**：自定义 ~50 行解析函数，HTML 转义输入后通过正则替换生成 HTML。
   Vue 和 Demo 共用相同逻辑（Vue 通过 import，Demo 内联）。
2. **MessageBubble 扩展**：新增 copy 按钮和时间戳，使用 `v-html` 渲染 markdown 内容。
3. **Message 类型扩展**：新增 `timestamp` 字段，创建消息时自动生成。
4. **Demo 同步更新**：`ui_lite/index.html` 内联相同解析器，用 `innerHTML` 渲染。

## 文件创建 / 变更

| 操作 | 文件 | 原因 |
|------|------|------|
| 创建 | `ui/src/lib/markdown.ts` | Markdown 解析器（零依赖） |
| 创建 | `ui/src/lib/markdown.test.ts` | 解析器单元测试 |
| 变更 | `ui/src/lib/types.ts` | Message 增加 timestamp |
| 变更 | `ui/src/components/MessageBubble.vue` | Copy 按钮 + 时间戳 + markdown 渲染 |
| 变更 | `ui/src/components/MessageList.vue` | 传递 timestamp |
| 变更 | `ui/src/components/ChatContainer.vue` | 创建消息时添加 timestamp |
| 变更 | `ui/src/App.vue` | 创建消息时添加 timestamp |
| 变更 | `ui_lite/index.html` | 同功能同步 |

## 风险

- **v-html XSS**：用户输入中的 HTML 必须先转义再解析 markdown。markdown 解析器第一步就是 HTML 转义，保证安全。
- **markdown 解析不完整**：自定义解析器不处理嵌套表格、HTML 嵌入等复杂用例。聊天场景足够用。
- **clipboard API 兼容性**：`navigator.clipboard` 需要安全上下文（localhost 满足），旧浏览器降级为静默失败。

## 依赖

- 001-chat-ui：MessageBubble, MessageList, ChatContainer, Message 类型
- 003-llm-api-config：App.vue（消息创建逻辑）
