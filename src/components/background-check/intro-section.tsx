import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  ClipboardList,
  Download,
} from 'lucide-react'

const HOW_IT_WORKS = [
  { icon: <ClipboardList className="h-6 w-6" />, title: 'Insira os dados', description: 'Nome, CPF e data de nascimento do candidato' },
  { icon: <CreditCard className="h-6 w-6" />, title: 'Pague R$\u00A099,90', description: 'Pagamento único e seguro via cartão' },
  { icon: <Download className="h-6 w-6" />, title: 'Receba o relatório', description: 'Resultado completo em PDF em minutos' },
]

const BENEFITS = [
  { icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, text: 'Contrate com segurança' },
  { icon: <Clock className="h-5 w-5 text-emerald-500" />, text: 'Resultado em minutos' },
  { icon: <FileText className="h-5 w-5 text-emerald-500" />, text: 'Relatório completo em PDF' },
]

const CHECKS = [
  'Validação do CPF na Receita Federal',
  'Antecedentes criminais em bases públicas',
  'Processos judiciais cíveis',
  'Situação de crédito',
]

/**
 * Landing / intro section with hero, benefits, how-it-works and CTA.
 * @param props.onStart - Callback to advance to the info step
 */
export function IntroSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-600 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 space-y-3">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
              Serviço Avulso
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">
              Consulta de Antecedentes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Verifique antecedentes criminais, processos judiciais e situação de crédito de candidatos antes de contratar. Proteja sua casa e sua família.
            </p>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">R$&nbsp;99,90</span>
              <span className="text-sm text-muted-foreground">por consulta</span>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {BENEFITS.map((b) => (
          <div key={b.text} className="flex items-center gap-3 rounded-lg border p-4">
            {b.icon}
            <span className="text-sm font-medium">{b.text}</span>
          </div>
        ))}
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center gap-2 p-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-primary">
                  {s.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">{i + 1}.</span>
                  <span className="text-sm font-semibold">{s.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What's included */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">O que é verificado</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <Button size="lg" className="w-full text-base" onClick={onStart}>
        Iniciar Consulta — R$&nbsp;99,90
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Este é um serviço avulso. Cada consulta é cobrada separadamente e não faz parte da assinatura.
      </p>
    </div>
  )
}
