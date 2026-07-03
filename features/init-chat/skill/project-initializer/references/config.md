# MCP/API 配置

所有外部服务调用在此配置。以下为占位符，部署时替换为实际端点。

```yaml
# MCP 服务器
mcp:
  # 获取仓库信息（分支列表、Tag 列表）
  repo_info:
    endpoint: "<MCP_SERVER>/repo-info"
    method: POST
    description: "获取指定 GitHub 仓库的分支列表和 Tag 列表"

  # 提交最终表单
  form_submit:
    endpoint: "<MCP_SERVER>/submit-form"
    method: POST
    description: "提交最终项目初始化 JSON 配置"

# API 服务（非 MCP，传统 REST）
api:
  # 验证仓库 URL 是否可访问
  validate_repo_url:
    endpoint: "<API>/validate-repo"
    method: GET
    description: "检查 GitHub 仓库 URL 是否有效且可克隆"

  # 推送项目到远程服务器（阶段 7b 使用）
  remote_project:
    endpoint: "<REMOTE_SERVER>/api/projects"
    method: POST
    description: "推送最终项目配置到远程服务器。替换 <REMOTE_SERVER> 为实际地址。"
```
