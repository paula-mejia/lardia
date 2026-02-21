import { Receipt, FileText, Bell, Zap } from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "DAE pronta para pagar",
    description:
      "Todo mês enviamos a guia DAE no seu WhatsApp. É só clicar e pagar.",
  },
  {
    icon: FileText,
    title: "Contracheque pelo WhatsApp",
    description:
      "Seu empregado recebe o contracheque direto no celular e confirma com um 'Sim'.",
  },
  {
    icon: Bell,
    title: "Alertas antes do prazo",
    description:
      "Férias, 13º, vencimentos. Você recebe o aviso antes, nunca depois.",
  },
  {
    icon: Zap,
    title: "Suporte imediato",
    description:
      "Dúvida? Responde no mesmo WhatsApp. Sem app, sem portal, sem fila.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-emerald-950 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Tudo chega no seu WhatsApp
        </h2>
        <p className="text-emerald-200/70 text-lg sm:text-xl max-w-3xl mx-auto">
          Você não precisa entrar na plataforma. A LarDia faz tudo e te avisa
          pelo WhatsApp.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-emerald-200/20 bg-white p-8"
          >
            <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
              <f.icon className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {f.title}
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
