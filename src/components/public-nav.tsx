import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo-sm.png" alt="LarDia" width={120} height={40} className="h-9 w-auto" priority />
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
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800">Comece agora</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
