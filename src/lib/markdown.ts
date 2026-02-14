// Simple markdown to HTML converter (no external dependencies)
// Handles: headings, paragraphs, bold, links, lists, blockquotes, tables, hr, inline code

export function markdownToHtml(md: string): string {
  const lines = md.split('\n')
  const html: string[] = []
  let inList = false
  let inTable = false
  let inBlockquote = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Blank line
    if (line.trim() === '') {
      if (inList) { html.push('</ul>'); inList = false }
      if (inTable) { html.push('</tbody></table>'); inTable = false }
      if (inBlockquote) { html.push('</blockquote>'); inBlockquote = false }
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      html.push('<hr class="my-8 border-border" />')
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = inlineFormat(headingMatch[2])
      const id = headingMatch[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
      const sizes: Record<number, string> = {
        2: 'text-2xl font-bold mt-10 mb-4',
        3: 'text-xl font-semibold mt-8 mb-3',
        4: 'text-lg font-semibold mt-6 mb-2',
      }
      html.push(`<h${level} id="${id}" class="${sizes[level] || 'font-bold mt-6 mb-2'}">${text}</h${level}>`)
      continue
    }

    // Table row
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '').map(c => inlineFormat(c.trim()))

      // Skip separator row
      if (cells.every(c => /^[-:]+$/.test(c.replace(/<[^>]+>/g, '')))) continue

      if (!inTable) {
        html.push('<table class="w-full my-6 text-sm border-collapse">')
        html.push(`<thead><tr>${cells.map(c => `<th class="border border-border px-3 py-2 text-left font-semibold bg-muted/50">${c}</th>`).join('')}</tr></thead>`)
        html.push('<tbody>')
        inTable = true
      } else {
        html.push(`<tr>${cells.map(c => `<td class="border border-border px-3 py-2">${c}</td>`).join('')}</tr>`)
      }
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      const text = inlineFormat(line.replace(/^>\s*/, ''))
      if (!inBlockquote) {
        html.push('<blockquote class="border-l-4 border-emerald-500 pl-4 py-2 my-6 text-muted-foreground italic">')
        inBlockquote = true
      }
      html.push(`<p>${text}</p>`)
      continue
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      const text = inlineFormat(line.replace(/^[-*]\s+/, ''))
      if (!inList) { html.push('<ul class="list-disc pl-6 my-4 space-y-1">'); inList = true }
      html.push(`<li>${text}</li>`)
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s+/)) {
      const text = inlineFormat(line.replace(/^\d+\.\s+/, ''))
      if (!inList) { html.push('<ul class="list-decimal pl-6 my-4 space-y-1">'); inList = true }
      html.push(`<li>${text}</li>`)
      continue
    }

    // Paragraph
    if (inList) { html.push('</ul>'); inList = false }
    if (inBlockquote) { html.push('</blockquote>'); inBlockquote = false }
    html.push(`<p class="my-4 leading-relaxed">${inlineFormat(line)}</p>`)
  }

  if (inList) html.push('</ul>')
  if (inTable) html.push('</tbody></table>')
  if (inBlockquote) html.push('</blockquote>')

  return html.join('\n')
}

function inlineFormat(text: string): string {
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">$1</a>')
  // Bold **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Inline code `text`
  text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
  // Italic *text* (after bold)
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return text
}
