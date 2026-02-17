import Link from "next/link";
import { Calculator } from "lucide-react";

export default function CalculatorSection() {
  return (
    <section className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-gray-900 rounded-2xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left */}
        <div>
          <span className="inline-block text-xs font-semibold tracking-wide uppercase bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full mb-5">
            Ferramenta Gratuita
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Calcule a folha agora mesmo
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Quer saber quanto custa manter uma empregada doméstica registrada com
            todos os encargos? Use nossa calculadora interativa.
          </p>
          <Link
            href="/simulador"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
          >
            <Calculator className="h-4 w-4" />
            Abrir calculadora
          </Link>
        </div>

        {/* Right — static simulation card */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-1">
            Simulação Rápida
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Salário Bruto: R$ 1.800,00
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">INSS (Empregado)</span>
              <span className="text-red-400">— R$ 142,80</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Vale Transporte</span>
              <span className="text-red-400">— R$ 108,00</span>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
            <span className="text-sm text-slate-300">Líquido a Pagar</span>
            <span className="text-xl font-bold text-emerald-400">
              R$ 1.549,20
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
