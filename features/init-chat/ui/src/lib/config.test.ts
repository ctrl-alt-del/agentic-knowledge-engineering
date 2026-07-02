import { describe, it, expect } from 'vitest'
import { isConfigValid, resolveApiKey } from './config'
import type { AkeConfig } from './config'

const validConfig: AkeConfig = {
  llm: {
    provider: 'openai-compatible',
    apiKey: 'sk-test123',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    options: { temperature: 0.7, maxTokens: 4096, stream: true },
  },
  skills: { paths: ['skill/'], autoload: ['project-initializer'] },
}

describe('isConfigValid', () => {
  it('returns true for valid config', () => {
    expect(isConfigValid(validConfig)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isConfigValid(null)).toBe(false)
  })

  it('returns false when apiKey is placeholder', () => {
    const cfg = { ...validConfig, llm: { ...validConfig.llm, apiKey: '<PLACEHOLDER>' } }
    expect(isConfigValid(cfg)).toBe(false)
  })

  it('returns false when baseURL is placeholder', () => {
    const cfg = { ...validConfig, llm: { ...validConfig.llm, baseURL: '<PLACEHOLDER>' } }
    expect(isConfigValid(cfg)).toBe(false)
  })

  it('returns false when model is placeholder', () => {
    const cfg = { ...validConfig, llm: { ...validConfig.llm, model: '<PLACEHOLDER>' } }
    expect(isConfigValid(cfg)).toBe(false)
  })

  it('returns false when apiKey is empty', () => {
    const cfg = { ...validConfig, llm: { ...validConfig.llm, apiKey: '' } }
    expect(isConfigValid(cfg)).toBe(false)
  })

  it('returns false when values use env var refs', () => {
    const cfg = { ...validConfig, llm: { ...validConfig.llm, apiKey: '${OPENAI_KEY}' } }
    expect(isConfigValid(cfg)).toBe(false)
  })
})

describe('resolveApiKey', () => {
  it('returns plain key as-is', () => {
    expect(resolveApiKey('sk-test')).toBe('sk-test')
  })
})
