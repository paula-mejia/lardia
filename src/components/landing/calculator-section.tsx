'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calculator } from 'lucide-react'
import { calculatePayroll } from '@/lib/calc'

const MIN_SALARY = 1621
const MAX_SALARY = 8000

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CalculatorSection() {
  const [salary, setSalary] = useState(1621)

  const result = useMemo(() => {
    return calculatePayroll({
      grossSalary: salary,
      dependents: 0,
      overtimeHours: 0,
      absenceDays: 0,
      otherEarnings: 0,
      otherDeductions: 0,
    })
  }, [salary])

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalary(Number(e.target.value))
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/\D/g, ''))
    if (val >= MIN_SALARY && val <= MAX_SALARY) {
      setSalary(val)
    } else if (val > MAX_SALARY) {
      setSalary(MAX_SALARY)
    }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-slate-900 rounded-3xl p-10 sm:p-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-center shadow-2xl">
        {/* Left */}
        <div>
          <span className="inline-block text-xs font-semibold tracking-wide uppercase bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full mb-5">
            Simulador 2026
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5">
            Saiba exatamente quanto custa seu{' '}
            <span className="text-emerald-400">empregado doméstico</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            Evite surpresas no final do mês. Calcule salários, encargos, férias e
            13º com nossa ferramenta atualizada com as leis vigentes.
          </p>
          <Link
            href="/simulador"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition"
          >
            <Calculator className="h-4 w-4" />
            Abrir simulador completo →
          </Link>
        </div>

        {/* Right — interactive mini calculator */}
        <div className="rounded-xl border border-slate-700 bg-white p-6 text-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Simulação Rápida</h3>
            <span className="text-xs text-gray-500 border border-gray-300 rounded-full px-2 py-0.5">
              Vigência 2026
            </span>
          </div>

          {/* Salary input + slider */}
          <div className="mb-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Salário Bruto</span>
              <span className="font-bold text-emerald-600">R$ {formatBRL(salary)}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-400">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={salary}
                onChange={handleInput}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <input
              type="range"
              min={MIN_SALARY}
              max={MAX_SALARY}
              step={1}
              value={salary}
              onChange={handleSlider}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-md"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #10B981 ${((salary - MIN_SALARY) / (MAX_SALARY - MIN_SALARY)) * 100}%, #e5e7eb ${((salary - MIN_SALARY) / (MAX_SALARY - MIN_SALARY)) * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>

          {/* Results */}
          <div className="space-y-3 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">(−) INSS Empregado</span>
              <span className="text-red-500 font-medium">R$ {formatBRL(result.inssEmployee)}</span>
            </div>
            {result.irrfEmployee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">(−) IRRF</span>
                <span className="text-red-500 font-medium">R$ {formatBRL(result.irrfEmployee)}</span>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="font-semibold text-sm">Salário Líquido</span>
              <span className="font-bold text-emerald-600">R$ {formatBRL(result.netSalary)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">DAE (INSS + FGTS + Seguro)</span>
              <span className="font-medium">R$ {formatBRL(result.daeTotal - result.inssEmployee)}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-sm">CUSTO TOTAL MENSAL</span>
                <p className="text-xs text-gray-500">(Salário + Encargos)</p>
              </div>
              <span className="text-xl font-bold text-emerald-600">R$ {formatBRL(result.totalEmployerCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
