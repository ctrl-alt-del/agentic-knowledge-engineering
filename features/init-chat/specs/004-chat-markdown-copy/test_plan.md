# Chat Markdown + Copy — 测试计划

## 单元测试

### markdown.ts
- [ ] **粗体**：`**hello**` → 包含 `<strong>hello</strong>`
- [ ] **斜体**：`*world*` → 包含 `<em>world</em>`
- [ ] **行内代码**：`` `code` `` → 包含 `<code>code</code>`
- [ ] **代码块**：```` ```block``` ```` → 包含 `<pre><code>block</code></pre>`
- [ ] **链接**：`[text](url)` → 包含 `<a href="url">text</a>`
- [ ] **无序列表**：`- a\n- b` → 包含 `<ul><li>a</li><li>b</li></ul>`
- [ ] **有序列表**：`1. a\n2. b` → 包含 `<ol><li>a</li><li>b</li></ol>`
- [ ] **段落**：`a\n\nb` → 包含 `<p>a</p><p>b</p>`
- [ ] **XSS 转义**：`<script>alert(1)</script>` → 不包含可执行 script 标签
- [ ] **组合标记**：`**bold *italic* bold**` → 正确嵌套
- [ ] **普通文本**：`hello world` → 正常输出，不被标记包裹
- [ ] **空字符串**：`""` → 返回空字符串

### MessageBubble（更新后）
- [ ] **渲染 markdown**：content 为 `**hi**` → 渲染为粗体 HTML
- [ ] **显示时间戳**：给定 timestamp → 显示格式化时间
- [ ] **显示复制按钮**：渲染后包含 copy 按钮元素
- [ ] **XSS 安全**：content 为 `<script>` 文本 → 不执行

### App.vue / ChatContainer（更新后）
- [ ] **消息包含 timestamp**：创建的消息有 timestamp 字符串字段

## 边界测试
- [ ] **空消息**：content 为空 → 不抛异常
- [ ] **极长消息**：5000+ 字符 → 解析不超时
- [ ] **特殊字符**：emoji、Unicode → 正常显示
- [ ] **嵌套标记**：`**a *b* c**` → 正确渲染
