import Link from 'next/link'
import Logo from '@/components/logo'

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-7" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">Suporte</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 LarDia. Todos os direitos reservados. CNPJ: 46.728.966/0001-40
          </p>
        </div>
      </div>
    </footer>
  )
}
