import { describe, it, expect } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('renders bold', () => {
    expect(renderMarkdown('**hello**')).toContain('<strong>hello</strong>')
  })

  it('renders italic', () => {
    expect(renderMarkdown('*world*')).toContain('<em>world</em>')
  })

  it('renders inline code', () => {
    expect(renderMarkdown('`code`')).toContain('<code>code</code>')
  })

  it('renders code block', () => {
    const result = renderMarkdown('```\nconst x = 1\n```')
    expect(result).toContain('<pre><code>')
    expect(result).toContain('const x = 1')
  })

  it('renders links', () => {
    expect(renderMarkdown('[text](https://example.com)')).toContain('<a href="https://example.com"')
    expect(renderMarkdown('[text](https://example.com)')).toContain('>text</a>')
  })

  it('renders unordered list', () => {
    const result = renderMarkdown('- item 1\n- item 2')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>item 1</li>')
    expect(result).toContain('<li>item 2</li>')
  })

  it('renders ordered list', () => {
    const result = renderMarkdown('1. first\n2. second')
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>first</li>')
    expect(result).toContain('<li>second</li>')
  })

  it('renders paragraphs', () => {
    const result = renderMarkdown('hello\n\nworld')
    expect(result).toContain('<p>hello</p>')
    expect(result).toContain('<p>world</p>')
  })

  it('escapes HTML to prevent XSS', () => {
    const result = renderMarkdown('<script>alert(1)</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('handles combined formatting', () => {
    const result = renderMarkdown('**bold *italic* bold**')
    expect(result).toContain('<strong>')
    expect(result).toContain('<em>')
  })

  it('handles plain text', () => {
    const result = renderMarkdown('hello world')
    expect(result).toContain('hello world')
  })

  it('handles empty string', () => {
    expect(renderMarkdown('')).toBe('')
  })

  it('handles special chars in code blocks safely', () => {
    const result = renderMarkdown('```\n<div>html</div>\n```')
    expect(result).toContain('<pre><code>')
    expect(result).toContain('&lt;div&gt;html&lt;/div&gt;')
  })
})
