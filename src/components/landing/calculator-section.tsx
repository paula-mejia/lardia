import Link from "next/link";
import { Calculator } from "lucide-react";

// Real calculation based on salário mínimo 2026 (R$ 1.621,00)
// INSS employee: 1621 * 7.5% = 121.58
// IRRF: exempt (base < 2428.80 after deductions)
// INSS patronal: 1621 * 8% = 129.68
// GILRAT: 1621 * 0.8% = 12.97
// FGTS: 1621 * 8% = 129.68
// FGTS antecipação: 1621 * 3.2% = 51.87
// DAE = 121.58 + 129.68 + 12.97 + 129.68 + 51.87 = 445.78
// Custo total = net salary + DAE = 1499.42 + 445.78 = 1945.20

export default function CalculatorSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center shadow-2xl">
        {/* Left */}
        <div>
          <span className="inline-block text-xs font-semibold tracking-wide uppercase bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full mb-5">
            Ferramenta Gratuita
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Saiba exatamente quanto custa seu empregado doméstico
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Salário, encargos, FGTS, INSS patronal... tudo calculado com as
            tabelas oficiais de 2026. Sem surpresas no final do mês.
          </p>
          <Link
            href="/simulador"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
          >
            <Calculator className="h-4 w-4" />
            Simular com seu salário →
          </Link>
        </div>

        {/* Right — real simulation card */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Simulação Rápida
          </h3>

          {/* Salário Bruto */}
          <div className="flex justify-between text-sm mb-4">
            <span className="text-white font-medium">Salário Bruto</span>
            <span className="text-white font-semibold">R$ 1.621,00</span>
          </div>

          <div className="border-t border-slate-700 pt-3 mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Encargos do Empregado</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">INSS (progressivo)</span>
                <span className="text-red-400">− R$ 121,58</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">IRRF</span>
                <span className="text-slate-500">R$ 0,00</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Salário Líquido</span>
              <span className="text-emerald-400 font-semibold">R$ 1.499,42</span>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Encargos do Empregador</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">INSS Patronal (8%)</span>
                <span className="text-slate-300">R$ 129,68</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">GILRAT (0,8%)</span>
                <span className="text-slate-300">R$ 12,97</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">FGTS (8%)</span>
                <span className="text-slate-300">R$ 129,68</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Antecipação (3,2%)</span>
                <span className="text-slate-300">R$ 51,87</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">Total DAE</span>
              <span className="text-sky-400 font-bold">R$ 445,78</span>
            </div>
          </div>

          <div className="border-t-2 border-slate-600 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Custo Total Mensal</span>
              <span className="text-xl font-bold text-emerald-400">R$ 1.945,20</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Salário líquido + DAE</p>
          </div>
        </div>
      </div>
    </section>
  );
}
