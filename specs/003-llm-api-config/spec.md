# LLM API 配置 — 规范

## 用户故事
作为使用者，我希望通过一个配置文件夹定义要连接的 LLM API（OpenAI 兼容或 Anthropic 兼容），
启动后 Chat UI 自动加载配置、连接 LLM、载入指定技能，并通过对话与用户交互。

## 功能需求

### 配置文件
- [x] 提供 `ake.example.json` 模板文件，用户复制为 `ake.json` 后填入实际配置
- [x] `ake.json` 被 `.gitignore` 忽略，防止 API 密钥泄漏
- [x] 配置包含：`provider`（openai-compatible | anthropic）、`apiKey`、`baseURL`、`model`、`options`
- [x] 配置包含：`skills.paths`（技能目录路径）、`skills.autoload`（启动时自动加载的技能列表）

### LLM 连接
- [x] 启动时读取 `ake.json`，根据 `provider` 创建对应的 `LlmProvider` 实例
- [x] OpenAI 兼容 API：`POST {baseURL}/chat/completions`，返回完成或流式响应
- [x] Anthropic API：`POST {baseURL}/messages`，返回完成或流式响应
- [x] 支持流式输出，Chat UI 逐字/逐块显示

### 技能加载
- [x] 根据 `skills.paths` 扫描技能目录
- [x] 根据 `skills.autoload` 在启动时加载指定技能内容
- [x] 技能内容以 system 角色消息注入对话上下文

### 状态指示
- [x] Chat UI 头部显示当前连接状态（绿：已连接 / 黄：mock / 红：错误）
- [x] 显示当前模型名称和 provider 类型

### 降级
- [x] `ake.json` 不存在或格式错误时，降级使用 MockResponder
- [x] API 连接失败时，显示错误消息，不崩溃

## 验收标准

### 正常流程
- [x] 给定 `ake.json` 已配置 OpenAI 兼容 API，当启动时，则 Chat UI 连接该 API 并响应对话
- [x] 给定 `ake.json` 已配置 Anthropic API，当启动时，则 Chat UI 连接该 API 并响应对话
- [x] 给定 `skills.autoload: ["project-initializer"]`，当启动时，则项目初始化助手自动开始对话
- [x] 给定流式输出开启，当 LLM 响应时，则内容逐块显示在气泡中

### 边界情况
- [x] 给定 `ake.json` 不存在，当启动时，则使用 MockResponder，状态指示显示黄色
- [x] 给定 `ake.json` 格式错误（非法 JSON），当加载时，则降级为 mock，控制台输出错误信息
- [x] 给定 API 返回 4xx/5xx 错误，当调用时，则在气泡中显示错误消息
- [x] 给定非流式模式（stream: false），当 LLM 响应时，则一次性显示完整回复

## 非功能需求
- 所有 API 调用使用纯 `fetch()`，不引入额外的 SDK 依赖
- `LlmProvider` 接口变更向后兼容（MockResponder 同步更新）
- 配置文件通过 `ake.schema.json` 进行结构校验
