import { getAllPosts } from '@/lib/blog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import NewsletterSignup from '@/components/newsletter-signup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Lardia - Guias sobre eSocial e empregada doméstica',
  description:
    'Artigos, guias e dicas sobre eSocial doméstico, folha de pagamento, férias, rescisão e tudo sobre empregada doméstica no Brasil.',
  openGraph: {
    title: 'Blog | Lardia',
    description: 'Guias completos sobre eSocial doméstico e gestão de empregados domésticos.',
    type: 'website',
    url: 'https://lardia.com.br/blog',
  },
}

export default function BlogIndex() {
  const posts = getAllPosts()

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

      {/* Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Blog</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Guias sobre eSocial e empregada doméstica
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa saber para gerenciar sua empregada doméstica
            com seguranca e dentro da lei.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <time dateTime={post.date}>
                      {new Date(post.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime} min de leitura
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    {post.description}
                  </p>
                  <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    Ler artigo <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup source="blog" />

      {/* CTA */}
      <section className="border-t bg-emerald-50 dark:bg-emerald-950/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Cansado de calcular tudo manualmente?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            A Lardia automatiza folha de pagamento, férias, 13o e rescisão. Cadastre-se grátis.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Criar conta grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; 2026 Lardia. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  )
}
