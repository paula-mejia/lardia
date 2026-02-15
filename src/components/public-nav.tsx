import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          LarDia
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/simulador" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Simulador
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Blog
          </Link>
          <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            FAQ
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Comece agora</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
