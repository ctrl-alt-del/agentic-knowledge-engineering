import type { Message } from './types'
import type { SkillConfig } from './config'

function ts(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

export async function loadSkills(config: SkillConfig): Promise<Message[]> {
  const systemMessages: Message[] = []
  let id = 0

  for (const skillPath of config.paths) {
    for (const skillName of config.autoload) {
      try {
        const url = `/${skillPath.replace(/\/$/, '')}/${skillName}/SKILL.md`
        const response = await fetch(url)

        if (!response.ok) {
          console.warn(`Skill not found: ${skillName} at ${url}`)
          continue
        }

        const content = await response.text()
        systemMessages.push({
          id: `skill-${id++}`,
          role: 'system',
          content: `[Skill: ${skillName}]\n\n${content}`,
          timestamp: ts(),
        })
      } catch (err) {
        console.warn(`Failed to load skill ${skillName}:`, err)
      }
    }
  }

  return systemMessages
}
