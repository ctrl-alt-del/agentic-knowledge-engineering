# 项目初始化助手技能 — 测试计划

## SDD 单元测试

### SKILL.md 结构验证
- [ ] **文件存在**：`features/init-chat/skill/project-initializer/SKILL.md` 存在且包含 YAML frontmatter（name, description）
- [ ] **必需引用文件存在**：所有 `references/` 和 `assets/` 引用的文件均在磁盘

### output-schema.json 验证
- [ ] **合法 JSON Schema**：文件可被 `jsonschema` 库解析为有效 schema
- [ ] **必填字段齐全**：schema 包含 `project_name`, `description`, `custom`, `template`, `document_forward_knowledge`, `code_reverse_knowledge`, `capsule_knowledge`
- [ ] **枚举值完整**：`template` 枚举包含三个模板值，`repo_mode` 枚举包含 single/multi

### config.md 验证
- [ ] **无硬编码 URL**：config.md 中不包含真实的 `http://` 或 `https://` 链接（除说明性注释外）
- [ ] **占位符格式**：所有端点使用 `"<MCP_SERVER>/..."` 格式的占位符

### state-schema.json 验证
- [ ] **含 phase 字段**：schema 包含 `phase` 字段，指示中断时所在的阶段
- [ ] **含所有表单字段**：schema 包含表单的所有顶层字段

## 技能评估（Skill Creator）

### 测试用例

| ID | 场景 | 提示词 | 预期行为 |
|----|------|--------|---------|
| 1 | 新手选模板 | "我想建一个知识工程平台项目，但是不太懂这些配置选项，你帮我推荐一个方案" | LLM 询问项目意图 → 推荐模板 → 引导基础信息 |
| 2 | 老手自定义 | "我要创建项目叫 my-app，只要代码逆向知识和胶囊知识，单仓模式，GitHub 拉代码" | LLM 识别意图直接配置，减少不必要的反问 |
| 3 | 中断恢复 | 填写到能力选择阶段后中断，重新连接 | 检测到已保存状态 → 询问是否继续 → 从中断处继续 |
| 4 | 全开生态型 | "初始化一个完整的生态型项目，所有能力都要，资料从 GitHub 拉" | LLM 选择模板1 → 收集各模块子配置 |

### 自动评分断言（9 项）

| # | 断言 | 检查方式 |
|---|------|---------|
| 1 | `valid_output_json` | `json.loads()` + `jsonschema.validate()` 通过 |
| 2 | `project_name_length` | 1 ≤ len(name) ≤ 20 |
| 3 | `description_length` | 1 ≤ len(desc) ≤ 50 |
| 4 | `all_required_fields` | 所有必填字段存在且非 null |
| 5 | `template_enum_valid` | template ∈ {"template-1","template-2","template-3"} |
| 6 | `repo_mode_enum` | mode ∈ {"single","multi"} |
| 7 | `no_hardcoded_urls` | 输出中不含硬编码 API 端点 |
| 8 | `repo_url_format` | 仓库 URL 匹配 `^https://github\.com/[\w.-]+/[\w.-]+$` |
| 9 | `custom_at_least_one` | custom 中至少一项 enabled |

## 边界测试
- [ ] **名称长度限制**：输入超过 20 字符 → 提示缩短
- [ ] **描述长度限制**：输入超过 50 字符 → 提示缩短
- [ ] **URL 格式校验**：输入 `not-a-url` → 提示格式错误
- [ ] **空能力选择**：不选任何能力 → 提示至少选一项
- [ ] **多仓库模式**：选择多仓模式 → 逐个收集每个仓库的 URL/分支/路径
