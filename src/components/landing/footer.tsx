import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="font-bold text-lg mb-2">LarDia</p>
            <p className="text-sm text-muted-foreground">
              eSocial sem erro, sem estresse.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm mb-3">Produto</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#calculadora" className="hover:text-foreground transition-colors">Calculadora</Link></li>
              <li><Link href="/simulador" className="hover:text-foreground transition-colors">Simulador</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Precos</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-sm mb-3">Conta</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Criar conta</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-sm mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/termos" className="hover:text-foreground transition-colors">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          &copy; 2026 LarDia. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
