import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadSkills } from './skillLoader'
import type { SkillConfig } from './config'

describe('loadSkills', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads skill content as system messages', async () => {
    const skillContent = '# Test Skill\nDo something useful.'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(skillContent),
    }))

    const config: SkillConfig = { paths: ['skill/'], autoload: ['test-skill'] }
    const result = await loadSkills(config)

    expect(result.length).toBe(1)
    expect(result[0].role).toBe('system')
    expect(result[0].content).toContain('[Skill: test-skill]')
    expect(result[0].content).toContain(skillContent)
  })

  it('handles missing skill gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }))

    const config: SkillConfig = { paths: ['skill/'], autoload: ['missing-skill'] }
    const result = await loadSkills(config)
    expect(result.length).toBe(0)
  })

  it('handles network error gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const config: SkillConfig = { paths: ['skill/'], autoload: ['test-skill'] }
    const result = await loadSkills(config)
    expect(result.length).toBe(0)
  })

  it('loads multiple skills from multiple paths', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Skill content'),
    }))

    const config: SkillConfig = {
      paths: ['skill/', 'extra/'],
      autoload: ['skill-a', 'skill-b'],
    }
    const result = await loadSkills(config)
    expect(result.length).toBe(4)
    expect(result.every((m) => m.role === 'system')).toBe(true)
  })
})
