# Remote API Authentication

远程 API 认证配置。如果远程服务器 `/api/projects` 需要认证，在此配置。
**文件不存在或内容为空表示无需认证。**

## Bearer Token 认证

```yaml
auth:
  type: bearer
  token: "<YOUR_BEARER_TOKEN>"
```

Agent 帮助开发者配置时：将 `<YOUR_BEARER_TOKEN>` 替换为实际 token，
POST 请求会自动添加 Header: `Authorization: Bearer <token>`。

## API Key 认证（自定义 Header）

```yaml
auth:
  type: api_key
  header: "x-api-key"
  value: "<YOUR_API_KEY>"
```

Agent 帮助开发者配置时：将 `header` 和 `value` 替换为实际的 header 名和 API key，
POST 请求会自动添加对应的自定义 Header。

## 无需认证（默认）

如果本文件不存在或为空，POST 请求不携带任何认证 Header。
