# LLM API 配置 — 测试计划

## 单元测试

### config.ts
- [ ] **加载合法配置**：读取 `ake.example.json` → 返回 `AkeConfig` 对象，所有字段可访问
- [ ] **配置缺失降级**：`ake.json` 不存在 → 返回 mock 模式标志
- [ ] **格式错误降级**：`ake.json` 内容非法 JSON → 返回错误信息，不抛异常

### OpenAiProvider
- [ ] **请求格式**：给定 messages 数组，构造的请求 body 符合 OpenAI chat completions 格式
- [ ] **非流式响应**：mock fetch 返回标准 JSON → 提取 `choices[0].message.content`
- [ ] **流式响应**：mock fetch 返回 SSE 数据 → 每个 chunk 调用 `onChunk`，最后 resolve
- [ ] **错误处理**：API 返回 4xx → throw 带状态码的错误消息

### AnthropicProvider
- [ ] **请求格式**：给定 messages 数组，构造的请求 body 符合 Anthropic messages 格式
- [ ] **非流式响应**：mock fetch 返回标准 JSON → 提取 `content[0].text`
- [ ] **流式响应**：mock fetch 返回 SSE 事件 → 每个 text_delta 调用 `onChunk`
- [ ] **错误处理**：API 返回 5xx → throw 带状态码的错误消息

### skillLoader.ts
- [ ] **加载技能文件**：给定有效路径 → 读取 SKILL.md 内容并返回
- [ ] **技能缺失处理**：给定不存在的目录 → 返回空数组，不抛异常
- [ ] **多技能合并**：给定多个 autoload 技能 → 返回拼接后的 system 消息数组
- [ ] **忽略非 SKILL.md 文件**：目录中有其他文件 → 仅读取 SKILL.md

### MockResponder（更新后）
- [ ] **忽略 history**：给定多轮对话 messages → 仍返回随机单个响应
- [ ] **延迟不变**：300-1500ms 范围内
- [ ] **响应多样**：多轮调用返回不同响应

### ChatContainer（更新后）
- [ ] **传递 messages**：send 时 provider.sendMessage 收到包含历史的全 messages 数组
- [ ] **流式更新**：provider 有 sendMessageStream → 助手消息逐 chunk 更新
- [ ] **非流式降级**：provider 无 sendMessageStream → 使用 sendMessage 一次性显示
- [ ] **欢迎消息**：首次加载仍显示 "Hello! How can I help you today?"

### ConfigStatus
- [ ] **显示 provider 名称**：给定 config → 显示 "Anthropic" 或 "OpenAI Compatible"
- [ ] **显示模型**：给定 config → 显示模型名称
- [ ] **mock 状态**：无 config → 显示黄色标记和 "Mock"
- [ ] **错误状态**：连接失败 → 显示红色标记

## 集成测试
- [ ] **完整启动流**：`ake.json` 存在 + provider 连接成功 + 技能加载 + ChatContainer 渲染
- [ ] **降级流**：`ake.json` 不存在 → fallback 到 mock → ChatContainer 正常交互

## 边界测试
- [ ] **空 conversation history**：messages 数组为空 → provider 仍构造合法请求
- [ ] **极长 history**：50+ 轮对话 → 请求不超 JSON 大小限制
- [ ] **特殊字符**：消息包含 Unicode/emoji → API 请求正常编码
