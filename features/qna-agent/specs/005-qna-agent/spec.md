# Q&A Knowledge Agent — Specification

## User Story
作为知识工程平台用户，我希望通过对话方式查询知识库中的信息，获得基于真实知识源的准确回答，不产生编造内容，并在对话中不断积累可复用的记忆经验。

## UX/UI
- [x] Mockup: `ux-ui/mockup.html` — 左侧知识源管理 + 右侧对话区
- [x] Design philosophy: `ux-ui/design-philosophy.md` — "Structured Inquiry"

## Acceptance Criteria

### 知识查询（Happy Path）
- [x] Given 知识源已配置且索引已构建，when 用户提问，then 返回带 [Source: file#section] 引用的回答
- [x] Given 知识源中没有相关信息，when 用户提问，then 回答 "我没有足够的信息来回答这个问题"
- [x] Given 用户提问，when 回答，then 显示置信度标签 [Confidence: high/medium/low]
- [x] Given 多个知识源匹配，when 检索，then 按相关度排序，引用 top-K（默认5）个来源

### 知识源管理
- [x] Given 用户进入页面，when sidebar 渲染，then 显示所有已配置知识源及其文件数
- [x] Given 用户添加知识源，when 填写路径/URL，then 新源加入列表并 PUT 到服务器
- [x] Given 用户切换优先级模式，when 选择 dir-first/json-first，then 检索顺序相应改变

### 记忆系统
- [x] Given 会话中有新知识，when 用户点击蒸馏或空闲30s，then 持久记忆被更新
- [x] Given 持久记忆已积累，when 新条目与旧条目>70%重叠，then 自动合并（condense）
- [x] Given 记忆条目 stale + 低访问 + 超龄，when 触发维护，then 自动归档（forget）
- [x] Given 旧记忆被新信息否定，when 蒸馏，then 旧条目标记 superseded_by

### 反编造（Anti-fabrication）
- [x] Given 答案不在知识源中，when LLM 推理，then 不得编造——必须说 "我不知道"
- [x] Given 每次回答，when 包含事实陈述，then 必须有对应的 [Source:] 引用
- [x] Given 引用可能不准确，when 显示，then 标注置信度

### 性能
- [x] Given 知识源含 100+ markdown 文件，when 构建索引，then index.json < 知识源总大小的 5%
- [x] Given 浏览器启动，when 加载 index.json，then < 500ms
- [x] Given 用户发送消息，when 检索知识，then < 100ms（浏览器内搜索）

### 可移植性
- [x] Given 仅 agent/ 和 build-index.py，when 复制到新服务器，then agent 可独立运行
- [x] Given 新部署环境有自己 UI，when 加载 agent/skill/，then 技能无需修改即能用

## Edge Cases
- [x] When 知识源目录为空，then 提示用户添加知识源并显示示例
- [x] When knowledge-index.json 不存在，then 浏览器回退到运行时关键词搜索
- [x] When 知识源包含非 markdown 文件，then build-index.py 跳过并记录警告
- [x] When LLM API 不可用，then 回退到 mock 模式并显示黄色状态
- [x] When localStorage 超过 5MB，then 提示用户导出并清理旧记忆

## Non-Functional Requirements
- **Performance**: 检索 <100ms, 启动 <500ms, 回答流式返回
- **Accessibility**: 纯键盘可操作, 屏幕阅读器友好
- **Offline**: 不依赖互联网（知识源本地，LLM 可配置本地模型）
- **Portability**: agent/ 目录可独立部署到 AgentScope 等平台
- **Dependencies**: 零 npm/pip 依赖，Python 3 stdlib + 浏览器原生 API

## Language Policy
- 技能文档: 简体中文
- UI 标签: 简体中文
- 代码 (Python/JavaScript): 英文
- Schema/JSON keys: 英文
