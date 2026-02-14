import fs from 'fs'
import path from 'path'

export interface BlogPost {
  title: string
  description: string
  slug: string
  date: string
  author: string
  keywords: string[]
  relatedSlugs: string[]
  content: string
  readingTime: number
}

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

// Parse simple YAML frontmatter (no external dependency needed)
function parseFrontmatter(raw: string): { metadata: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { metadata: {}, content: raw }

  const yamlStr = match[1]
  const content = match[2].trim()
  const metadata: Record<string, unknown> = {}

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value: unknown = line.slice(colonIdx + 1).trim()

    // Handle arrays like ["a", "b"]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
    }
    // Remove surrounding quotes
    if (typeof value === 'string') {
      value = value.replace(/^["']|["']$/g, '')
    }

    metadata[key] = value
  }

  return { metadata, content }
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const { metadata, content } = parseFrontmatter(raw)

    return {
      title: (metadata.title as string) || '',
      description: (metadata.description as string) || '',
      slug: (metadata.slug as string) || file.replace('.md', ''),
      date: (metadata.date as string) || '',
      author: (metadata.author as string) || 'Equipe Lardia',
      keywords: (metadata.keywords as string[]) || [],
      relatedSlugs: (metadata.relatedSlugs as string[]) || [],
      content,
      readingTime: estimateReadingTime(content),
    }
  })

  // Sort by date descending
  posts.sort((a, b) => (a.date > b.date ? -1 : 1))
  return posts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug)
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  const all = getAllPosts()
  return post.relatedSlugs
    .map(slug => all.find(p => p.slug === slug))
    .filter((p): p is BlogPost => !!p)
}
