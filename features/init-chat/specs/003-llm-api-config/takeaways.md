# LLM API 配置 — 复盘

## 做得好的

- **配置驱动的架构**：`make.json` 作为单一配置入口，控制 LLM 类型、模型参数、技能加载。从 Mock 切换到真实 API 只需修改配置文件，代码零改动。
- **接口平滑升级**：`LlmProvider` 接口从 `sendMessage(content: string)` 升级到 `sendMessage(messages: Message[])，并增加可选的 `sendMessageStream`。通过 `shallowRef` 包装 provider 实现动态替换，不影响下游组件。
- **双协议 SSE 解析**：OpenAI（data: lines + [DONE] 终止）和 Anthropic（event/data lines + message_stop 终止）的流式解析都通过 `fetch().body.getReader()` 实现，零额外依赖。
- **技能热加载**：skillLoader 通过 `fetch()` 从静态路径加载 SKILL.md，支持多路径多技能。失败静默降级，不阻塞 UI。

## 学到的

- **`import.meta.env` 替代 `process.env`**：Vite 浏览器环境没有 Node.js 的 `process` 全局变量。环境变量解析需要使用 Vite 的 `import.meta.env` 机制。
- **`shallowRef` 用于 provider 替换**：Vue 的 `provide/inject` 在 setup 阶段绑定，后续 replacement 不会自动传播。使用 `shallowRef<LlmProvider>` 作为可变容器，外层包装一个代理对象传递给 `provide`。
- **Anthropic 的 system 字段**：Anthropic API 不接受 `system` role 的 message — 需要提取到请求体顶层的 `system` 字段。这与 OpenAI 的 `messages` 数组中嵌入 system message 不同。

## 技术惊喜

- **无 SDK 依赖实现双 API**：只用 `fetch()` 就实现了 OpenAI 和 Anthropic 两个 API 的完整对接（非流式 + 流式）。避免了 `@anthropic-ai/sdk` 和 `openai` 两个 npm 包，减少了项目依赖体积。
- **51 个测试全部通过**：feature 完成后，测试从 23 个增长到 51 个，涵盖 config 验证、provider 请求格式、SSE 流式解析、skill 加载、容错处理。

## 可复用模式

- **`shallowRef` + wrapper 模式**：需要运行时替换 inject 的依赖时，用 `shallowRef` 持有实际实现，用 wrapper 对象作为 inject 的键。下游组件解引用时始终拿到最新值。
- **`fetch` + SSE 手动解析模式**：比引入 SSE 库更轻量，两个 API 的 SSE 格式差异只需在各自的 provider 中处理，不影响公共接口。
