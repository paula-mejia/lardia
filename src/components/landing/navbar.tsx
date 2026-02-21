import Link from 'next/link'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'

export default function Navbar({ isLanding = false }: { isLanding?: boolean }) {
  const prefix = isLanding ? '' : '/'
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo className="h-9" />
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6">
            <a href={`${prefix}#funcionalidades`} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Funcionalidades
            </a>
            <a href={`${prefix}#precos`} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Preços
            </a>
            <Link href="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Blog
            </Link>
          </div>
          <Link href="/signup">
            <Button size="sm" className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white">Começar grátis</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
