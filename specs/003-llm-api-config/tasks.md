# LLM API 配置 — 任务

## Block 0: 规范与设计（编码前）
- [x] `doc-coauthoring`: spec.md + plan.md 已评审
- [x] `test_plan.md`: 测试场景已文档化

## Block 1: 配置文件

- [x] **Task 3.1**: 创建 `ake.example.json` + `ake.schema.json` + `.gitignore` 更新 + `config.ts`
  - 文件: `ake.example.json`, `ake.schema.json`, `.gitignore`, `ui/src/lib/config.ts`
  - 构建: `npm run build`
  - 测试: `npm test`

## Block 2: 接口升级

- [x] **Task 3.2**: 更新 `LlmProvider` 接口（`sendMessage(messages: Message[])` + `sendMessageStream?`）+ `types.ts` 增加 `system` role
  - 文件: `ui/src/lib/llmProvider.ts`, `ui/src/lib/types.ts`
  - 构建: `npm run build`
  - 测试: `npm test`

- [x] **Task 3.3**: 更新 `MockResponder` + `ChatContainer` 适配新接口 + 流式支持
  - 文件: `ui/src/lib/mockResponder.ts` + test, `ui/src/components/ChatContainer.vue` + test
  - 构建: `npm run build`
  - 测试: `npm test`

## Block 3: LLM Provider 实现

- [x] **Task 3.4**: 创建 `OpenAiProvider`（fetch-based，SSE 流式解析）
  - 文件: `ui/src/lib/openAiProvider.ts` + test
  - 构建: `npm run build`
  - 测试: `npm test`

- [x] **Task 3.5**: 创建 `AnthropicProvider`（fetch-based，SSE 流式解析）
  - 文件: `ui/src/lib/anthropicProvider.ts` + test
  - 构建: `npm run build`
  - 测试: `npm test`

## Block 4: 集成

- [x] **Task 3.6**: 创建 `skillLoader.ts` + `ConfigStatus.vue` + 更新 `App.vue`
  - 文件: `ui/src/lib/skillLoader.ts` + test, `ui/src/components/ConfigStatus.vue` + test, `ui/src/App.vue`
  - 构建: `npm run dev`
  - 测试: `npm test`

## Block 5: 发布

- [x] **Task 3.7**: 编写 takeaways.md、更新 MEMORY.md、specs/index.md、README.md、AGENTS.md
  - 文件: `specs/003-llm-api-config/takeaways.md`, `MEMORY.md`, `specs/index.md`, `README.md`, `AGENTS.md`
  - 构建: `npm run build`
  - 测试: `npm test`
