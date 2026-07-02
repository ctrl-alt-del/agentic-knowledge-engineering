# Chat Markdown + Copy — 复盘

## 做得好的

- **零依赖 Markdown 解析器**：~50 行纯函数，同时被 Vue（import）和 Demo（内联）使用。功能覆盖聊天场景 90%+ 的标记需求（粗体、斜体、代码、链接、列表、段落），XSS 安全（先转义再解析）。
- **复制按钮 UX**：Desktop hover 显示、touch 始终可见、1.5s "Copied!" 反馈。使用 `navigator.clipboard` API，降级静默失败。
- **时间戳自动化**：`timestamp` 字段在消息创建时自动生成，格式统一为 `YYYY-mm-dd HH:MM:SS`。Vue 和 Demo 使用相同的 `now()` 实现。

## 学到的

- **TypeScript ESM 中函数声明不保证提升**：`renderMarkdown` 在 `escapeHtml` 和 `inlineMarkdown` 之前定义时，运行时无法找到这两个函数。解决方案：将依赖函数定义在调用者之前。
- **`v-html` 与 XSS 的关系**：使用 `v-html` 渲染用户内容时必须确保内容已被 sanitize。Markdown 解析器的第一步就是 `escapeHtml`，因此所有 HTML 标签都被转义为纯文本后才开始解析 markdown 标记。
- **Message 接口变更的连锁影响**：给 `Message` 增加 `timestamp` 字段后，所有创建 Message 对象的地方都需要更新——包括组件、测试、provider 测试、skill loader。约 15 个位置需要修改。

## 技术惊喜

- **自定义 Markdown 解析器的性能**：解析 ~5000 字符的消息耗时 <1ms。对于聊天场景（每轮生成一条消息）完全够用。
- **CSS 变量在 Markdown 样式中的价值**：使用 `--muted`、`--cool-assistant` 等变量在 `msg` 容器中为 `<code>`、`<pre>`、`<a>` 等元素设置样式，保持设计系统一致性。

## 可复用模式

- **零依赖 Markdown 解析器**：HTML 转义 → 代码块隔离 → 段落/列表解析 → 内联标记替换。四段流水线，每段独立，易于扩展。
- **Copy-to-clipboard 模式**：`navigator.clipboard.writeText()` → 视觉反馈 → `setTimeout` 恢复。低侵入性，可内联到任何按钮上。
