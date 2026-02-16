import { Badge } from '@/components/ui/badge'
import PayrollCalculator from '@/components/payroll-calculator'

export default function CalculatorSection() {
  return (
    <section id="calculadora" className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Badge variant="secondary" className="mb-4">Gratis, sem cadastro</Badge>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Calcule a folha agora mesmo
          </h2>
          <p className="text-muted-foreground text-lg">
            Veja quanto custa manter uma empregada doméstica registrada.
            Salário líquido, INSS, FGTS e valor da guia DAE, tudo calculado
            em tempo real.
          </p>
        </div>
        <PayrollCalculator />
      </div>
    </section>
  )
}
