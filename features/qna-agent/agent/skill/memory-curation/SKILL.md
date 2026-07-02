---
name: memory-curation
description: 记忆管理技能。负责管理 agent 的记忆生命周期——添加、合并压缩、遗忘过期、更新已有记忆。被 qna-orchestrator 在适当时机触发使用。触发时机：对话中发现新知识、会话自然暂停、用户请求蒸馏。
---

# 记忆管理技能

你负责 agent 的记忆生命周期管理。记忆是 agent 在与用户交互中积累的知识，
存储在 `agent/memory/persistent.json` 中，按标签、置信度和来源组织。

## 核心原则

- **先读规则**：开始前先读 `references/condensation-rules.md` 了解完整规则
- **静默操作**：记忆更新对用户透明——不主动告知你在管理记忆
- **质量优先**：宁少勿滥。只记录真正有价值的知识，避免噪音
- **可追溯**：每条记忆记录 sources（来源：知识源文件 + 会话标识）

## 记忆生命周期

参考 `references/memory-schema.json` 了解记忆条目的完整结构。

### 1. 添加（Add）

**触发**：在对话中发现：
- 用户提供了知识源中不存在的新场景/信息
- 发现多个知识源之间的新关联
- 对话揭示了一个新的问题模式（可能重复出现）
- 用户表达了一个需要记录的需求/偏好

**操作**：创建新的记忆条目，最小结构如下：
```json
{
  "id": "mem-{timestamp}-{sequential}",
  "type": "learning",
  "tags": ["#topic1", "#topic2"],
  "content": "新发现的知识内容，用一两句话概括",
  "sources": ["knowledge-file.md#section", "session-context"],
  "confidence": "medium",
  "created": "ISO timestamp",
  "updated": "ISO timestamp",
  "access_count": 1,
  "stale": false
}
```

**type 选择**：
- `learning`: 从对话中学到的新知识
- `pattern`: 可复用的交互模式
- `gotcha`: 需要避雷的教训（类似 MEMORY.md 的 ⚡ 条目）
- `connection`: 知识源之间的新关联

### 2. 合并压缩（Condense）

**触发**：
- 新添加的条目与现有条目有 >70% 的内容重叠
- 多个条目描述同一概念的不同侧面

**操作**：
1. 找到重叠的条目组
2. 合并 content 为更精炼的表述
3. 保留所有 sources
4. 取最新的 created 和 updated 时间
5. 将 access_count 相加
6. 删除被合并的旧条目

### 3. 遗忘（Forget）

**触发**：条目同时满足：
- `stale == true` 且
- `access_count < 3` 且
- `年龄 > 30 天`（配置在服务器 config 中）

**操作**：从 active 集合中移除。如果一个条目被标记为 superseded_by，
直接将其标记为 stale。

### 4. 更新（Update）

**触发**：新信息与现有条目明显矛盾（高置信度的新信息否定旧信息）

**操作**：
1. 将旧条目标记为 `stale: true`
2. 在旧条目中设置 `superseded_by: "新条目ID"`
3. 创建新条目，复制关联的 sources 并添加新来源

### 5. 强化（Strengthen）

**触发**：现有记忆条目在对话中再次被证实/引用

**操作**：
1. 该条目的 `access_count += 1`
2. 更新 `updated` 时间戳
3. 如果之前为 medium 置信度，考虑升级为 high

## 与 orchestrator 的协作

orchestrator 会在以下时机暗示你运行记忆操作：
- 对话自然暂停（>1轮无人提问）
- 用户说「好的」「谢谢」「了解了」等结束语
- 用户明确询问记忆状态

在这种情况下，静默执行记忆评估。如果有值得记录的内容，添加条目。
如果没有，不需要做任何事。

## 记忆标记提示

在审视对话历史后，评估以下问题：
1. 用户的需求/问题是否能泛化成一个可复用的模式？
2. 是否发现了知识源之间的新关联？
3. 对话中是否有可以避免重复踩坑的经验？
4. 用户的表达方式是否提示了知识库的补充方向？

只记录经过上述评估确认有价值的内容。
