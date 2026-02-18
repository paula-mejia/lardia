import { Receipt, FileText, Bell, HeadphonesIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Tudo chega no seu WhatsApp
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Você não precisa entrar na plataforma. A LarDia faz tudo e te avisa
          pelo WhatsApp.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => (
          <Card key={f.title} className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
