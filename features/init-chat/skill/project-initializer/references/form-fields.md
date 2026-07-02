# 表单字段定义

## 基础信息字段

| 字段名（中文） | 字段名（JSON） | 约束 | 验证规则 | 说明 |
|--------------|---------------|------|---------|------|
| 项目名称 | `project_name` | ≤20 字符，必填 | `/^[\u4e00-\u9fa5a-zA-Z0-9_-]{1,20}$/` | 允许中文、英文、数字、下划线、连字符 |
| 描述 | `description` | ≤50 字符，必填 | `/^.{1,50}$/` | 自由文本 |

## 能力模块

### custom（自定义能力选择）

| 字段名（JSON） | 子配置项 | 说明 |
|---------------|---------|------|
| `document_forward_knowledge` | `enabled` (bool), `multi_source_md_conversion` (bool), `multimodal_image_parsing` (bool) | 文档正向知识：
多源格式 MD 转换：将不同格式文档转为统一 Markdown 结构。
多模态图片信息解析：从图片中提取文字、图表等结构化信息。 |
| `code_reverse_knowledge` | `enabled` (bool), `mode` (enum: "single"\|"multi"), `repositories` (array) | 代码逆向知识：从代码仓库自动提取架构、接口、依赖关系。支持单仓和多仓模式。 |
| `capsule_knowledge` | `enabled` (bool), `log_extraction_api` (string\|null), `local_upload` (bool) | 胶囊知识：从运行日志中提取行为模式和业务规则。 |
| `cross_domain_knowledge_graph` | `enabled` (bool) | 跨域知识图谱：连接不同来源知识，构建跨领域关联网络。无额外子配置。 |

## 模板

| 模板值 | 名称 | 包含能力 |
|--------|------|---------|
| `template-1` | 模板1：生态型 | 文档正向知识 + 代码逆向知识 + 胶囊知识 + 跨域知识图谱 |
| `template-2` | 模板2：单仓知识体系 | 文档正向知识 + 代码逆向知识 + 胶囊知识 |
| `template-3` | 模板3：自定义 | 用户自由组合 |

## 文档正向知识（document_forward_knowledge）

当 `custom.document_forward_knowledge.enabled` 为 true 时，收集以下信息：

| 来源类型 | 字段名（JSON） | 子字段 | 说明 |
|---------|---------------|--------|------|
| GitHub 仓库 | `github` (array) | `url` (string), `branch_or_tag` (string), `branch_path` (string) | 支持多个仓库。URL 格式：`https://github.com/<owner>/<repo>` |
| 本地上传 | `local_upload` (bool) | — | 是否启用本地上传 |

## 代码逆向知识（code_reverse_knowledge）

当 `custom.code_reverse_knowledge.enabled` 为 true 时：

| 字段 | 类型 | 枚举/约束 | 说明 |
|------|------|---------|------|
| `mode` | string | `"single"` \| `"multi"` | 仓库模式 |
| `repositories` | array | — | 仓库列表 |

每个仓库项：

| 字段 | 类型 | 约束 |
|------|------|------|
| `url` | string | `^https://github\.com/[\w.-]+/[\w.-]+$` |
| `branch_or_tag` | string | 非空，默认 `"main"` |
| `branch_path` | string | 可选，默认 `"/"` |

## 胶囊知识（capsule_knowledge）

当 `custom.capsule_knowledge.enabled` 为 true 时：

| 字段 | 类型 | 说明 |
|------|------|------|
| `log_extraction_api` | string \| null | 日志提取接口 URL |
| `local_upload` | bool | 是否启用本地上传 |

## 跨域知识图谱（cross_domain_knowledge_graph）

当 `custom.cross_domain_knowledge_graph.enabled` 为 true 时：
- 无额外子配置项，仅确认启用。`enabled: true` 即为完成。

## 通用约束

- 格式：最终输出必须为合法 JSON
- URL 验证：所有 GitHub 链接必须匹配标准格式
- 非空约束：已启用模块的子配置项不能全部为空
