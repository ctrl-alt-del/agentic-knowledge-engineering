function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
}

export function renderMarkdown(text: string): string {
  let html = escapeHtml(text)

  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`
  })

  const blocks: string[] = []
  let current = ''
  let inList: 'ul' | 'ol' | null = null

  const lines = html.split('\n')
  for (let i = 0; i <= lines.length; i++) {
    const line = i < lines.length ? lines[i] : ''
    const trimmed = line.trim()

    if (trimmed === '') {
      if (inList) {
        blocks.push(`</${inList}>`)
        inList = null
      }
      if (current) {
        blocks.push(`<p>${inlineMarkdown(current.trim())}</p>`)
        current = ''
      }
      continue
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)/)
    if (ulMatch) {
      if (inList !== 'ul') {
        if (inList) blocks.push(`</${inList}>`)
        blocks.push('<ul>')
        inList = 'ul'
      }
      blocks.push(`<li>${inlineMarkdown(ulMatch[1])}</li>`)
      continue
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)
    if (olMatch) {
      if (inList !== 'ol') {
        if (inList) blocks.push(`</${inList}>`)
        blocks.push('<ol>')
        inList = 'ol'
      }
      blocks.push(`<li>${inlineMarkdown(olMatch[1])}</li>`)
      continue
    }

    if (inList) {
      blocks.push(`</${inList}>`)
      inList = null
    }

    if (current) current += '\n'
    current += line
  }

  if (current) blocks.push(`<p>${inlineMarkdown(current)}</p>`)

  return blocks.join('')
}
