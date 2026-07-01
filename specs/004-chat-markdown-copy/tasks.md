# Chat Markdown + Copy — 任务

## Block 0: 规范与设计（编码前）
- [x] `doc-coauthoring`: spec.md + plan.md 已评审
- [x] `test_plan.md`: 测试场景已文档化

## Block 1: 基础

- [ ] **Task 4.1**: 添加 `timestamp` 到 `Message` 类型 + 创建 markdown 解析器
  - 文件: `ui/src/lib/types.ts`, `ui/src/lib/markdown.ts`, `ui/src/lib/markdown.test.ts`
  - 构建: `npm run build`
  - 测试: `npm test`

## Block 2: Vue 组件

- [ ] **Task 4.2**: 更新 `MessageBubble` + `MessageList` + `ChatContainer` + `App.vue`
  - 文件: `ui/src/components/MessageBubble.vue` + test, `ui/src/components/MessageList.vue`, `ui/src/components/ChatContainer.vue` + test, `ui/src/App.vue`
  - 构建: `npm run build`
  - 测试: `npm test`

## Block 3: Demo

- [ ] **Task 4.3**: 更新 `ui_lite/index.html`（markdown 渲染 + 复制按钮 + 时间戳）
  - 文件: `ui_lite/index.html`
  - 构建: 浏览器手动测试
  - 测试: 浏览器手动测试

## Block 4: 发布

- [ ] **Task 4.4**: 编写 takeaways.md、更新 MEMORY.md、specs/index.md、README.md、AGENTS.md
  - 文件: `specs/004-chat-markdown-copy/takeaways.md`, `MEMORY.md`, `specs/index.md`, `README.md`, `AGENTS.md`
  - 构建: `npm run build`
  - 测试: `npm test`
