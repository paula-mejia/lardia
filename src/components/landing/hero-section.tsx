import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Shield, Clock, CheckCircle2, Users, Calendar, DollarSign, ChevronRight } from 'lucide-react'

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl" />

      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 text-center">
            <div className="inline-block px-3 py-0.5 bg-white dark:bg-zinc-700 rounded text-[10px] text-zinc-400 font-mono">
              app.lardia.com.br/folha
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Payroll Summary Card */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Resumo da Folha</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-medium">
                Fev 2026
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2.5">
                <p className="text-[10px] text-zinc-500 mb-0.5">Salário Bruto</p>
                <p className="text-base font-bold text-zinc-900 dark:text-white">R$ 1.800,00</p>
              </div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2.5">
                <p className="text-[10px] text-zinc-500 mb-0.5">INSS (7,5%)</p>
                <p className="text-base font-bold text-red-500">- R$ 135,00</p>
              </div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2.5">
                <p className="text-[10px] text-zinc-500 mb-0.5">FGTS (8%)</p>
                <p className="text-base font-bold text-amber-600">R$ 144,00</p>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2.5 border border-emerald-200 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">Líquido a Pagar</p>
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">R$ 1.665,00</p>
              </div>
            </div>
          </div>

          {/* Bottom row: mini calendar + employee */}
          <div className="grid grid-cols-5 gap-3">
            {/* Mini Calendar */}
            <div className="col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">Fev 2026</span>
              </div>
              <div className="grid grid-cols-7 gap-px text-[8px] text-center text-zinc-400">
                {['D','S','T','Q','Q','S','S'].map((d, i) => (
                  <span key={i} className="font-medium">{d}</span>
                ))}
                {Array.from({ length: 28 }, (_, i) => (
                  <span
                    key={i}
                    className={`py-0.5 rounded ${
                      i + 1 === 5
                        ? 'bg-emerald-500 text-white font-bold'
                        : i + 1 === 20
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[8px] text-zinc-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pgto
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1" /> eSocial
              </div>
            </div>

            {/* Employee list */}
            <div className="col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">Empregados</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Maria Silva', role: 'Doméstica', status: 'Ativo' },
                  { name: 'João Santos', role: 'Jardineiro', status: 'Ativo' },
                ].map((emp) => (
                  <div key={emp.name} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[8px] font-bold text-emerald-700 dark:text-emerald-400">
                      {emp.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{emp.name}</p>
                      <p className="text-[8px] text-zinc-400">{emp.role}</p>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                Para empregadores domésticos no Brasil 🇧🇷
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Chega de dor de cabeça{' '}
                <span className="text-emerald-600 dark:text-emerald-400">
                  com o eSocial doméstico
                </span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl">
                Calcule folha de pagamento, gere guias e mantenha tudo em dia com o eSocial — sem complicação, sem contador.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                  Começar grátis
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Calcular salário
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { icon: Shield, text: 'Dados criptografados' },
                { icon: Clock, text: 'Folha em 5 minutos' },
                { icon: CheckCircle2, text: '100% conforme eSocial' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Icon className="h-4 w-4 text-emerald-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="lg:pl-8">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
