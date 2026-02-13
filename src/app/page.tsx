import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Gift, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import PayrollCalculator from '@/components/payroll-calculator'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Lardia</h1>
          <p className="text-muted-foreground">eSocial sem erro, sem estresse</p>
          <div className="flex justify-center gap-3 mt-4">
            <Link href="/login">
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Criar conta</Button>
            </Link>
          </div>
        </div>

        {/* Calculator Links */}
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="#calculadora" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-4">
                <Calculator className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Folha de Pagamento</p>
                  <p className="text-xs text-muted-foreground">Salário, INSS, FGTS, DAE</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/calculadoras/decimo-terceiro" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-4">
                <Gift className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">13º Salário</p>
                  <p className="text-xs text-muted-foreground">1ª e 2ª parcela</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Payroll Calculator */}
        <div id="calculadora">
          <PayrollCalculator />
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-xs text-muted-foreground">
          <p>Valores calculados com base nas tabelas de 2026.</p>
          <p className="mt-1">INSS, FGTS e IRRF atualizados conforme legislação vigente.</p>
        </footer>
      </div>
    </main>
  )
}
