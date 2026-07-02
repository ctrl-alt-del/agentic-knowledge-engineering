export interface LlmOptions {
  temperature: number
  maxTokens: number
  stream: boolean
}

export interface LlmConfig {
  provider: 'openai-compatible' | 'anthropic'
  apiKey: string
  baseURL: string
  model: string
  options: LlmOptions
}

export interface SkillConfig {
  paths: string[]
  autoload: string[]
}

export interface AkeConfig {
  llm: LlmConfig
  skills: SkillConfig
}

export interface ConfigResult {
  config: AkeConfig | null
  useMock: boolean
  error?: string
}

function isPlaceholder(value: string): boolean {
  return value === '<PLACEHOLDER>' || value === '' || value.startsWith('${')
}

export function isConfigValid(config: AkeConfig | null): boolean {
  if (!config) return false
  const { llm } = config
  return (
    llm.provider !== undefined &&
    !isPlaceholder(llm.apiKey) &&
    !isPlaceholder(llm.baseURL) &&
    !isPlaceholder(llm.model)
  )
}

export function resolveApiKey(apiKey: string): string {
  const envMatch = apiKey.match(/^\$\{(.+)\}$/)
  if (envMatch) {
    return (import.meta.env?.[envMatch[1]] as string) || ''
  }
  return apiKey
}
