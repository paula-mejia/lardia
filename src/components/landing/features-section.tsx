import { Receipt, FileText, Bell, HeadphonesIcon } from "lucide-react";

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
    icon: HeadphonesIcon,
    title: "Suporte humano",
    description:
      "Dúvida? Responde no mesmo WhatsApp. Sem app, sem portal, sem fila.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-emerald-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Tudo chega no seu WhatsApp
        </h2>
        <p className="text-emerald-200/70 text-lg max-w-2xl mx-auto">
          Você não precisa entrar na plataforma. A LarDia faz tudo e te avisa
          pelo WhatsApp.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border-2 border-emerald-700/50 bg-emerald-900/40 p-6 backdrop-blur-sm"
          >
            <f.icon className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {f.title}
            </h3>
            <p className="text-emerald-200/60 text-sm leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
