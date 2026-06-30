import { describe, it, expect } from 'vitest'
import { MockResponder } from './mockResponder'

describe('MockResponder', () => {
  const responder = new MockResponder()

  it('returns a non-empty string', async () => {
    const response = await responder.sendMessage('hello')
    expect(response).toBeTruthy()
    expect(typeof response).toBe('string')
  })

  it('returns a response within 300-1500ms', async () => {
    const start = Date.now()
    await responder.sendMessage('hello')
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(300)
    expect(elapsed).toBeLessThanOrEqual(1500)
  })

  it('returns responses that vary across calls', async () => {
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => responder.sendMessage('x')),
    )
    const unique = new Set(responses)
    expect(unique.size).toBeGreaterThan(1)
  })
})
