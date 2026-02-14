import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { markdownToHtml } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Static generation for all blog posts
export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }))
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title} | Lardia`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      url: `https://lardia.com.br/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getRelatedPosts(post)
  const contentHtml = markdownToHtml(post.content)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lardia',
      url: 'https://lardia.com.br',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lardia.com.br/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Lardia
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-medium text-emerald-600">
              Blog
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Comece agora</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article */}
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar ao blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <time dateTime={post.date}>
              {new Date(post.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min de leitura
            </span>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose-custom text-foreground"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* CTA Banner */}
        <div className="my-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Simplifique o eSocial com a Lardia</h3>
          <p className="text-muted-foreground mb-4">
            Calculos automaticos, lembretes de prazos e tudo que voce precisa para ficar em dia.
          </p>
          <Link href="/signup">
            <Button>
              Comece agora gratis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-bold mb-6">Artigos relacionados</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(r.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <h3 className="font-semibold text-sm group-hover:text-emerald-600">
                        {r.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Footer */}
      <footer className="border-t py-8 mt-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; 2026 Lardia. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  )
}
