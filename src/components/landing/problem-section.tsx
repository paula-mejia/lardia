import { AlertTriangle, Clock, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    icon: AlertTriangle,
    bgColor: "bg-red-100",
    iconColor: "text-red-500",
    title: "eSocial obrigatório e confuso",
    desc: "Todo empregador doméstico precisa declarar. O sistema do governo é complexo e qualquer erro trava tudo.",
  },
  {
    icon: Clock,
    bgColor: "bg-amber-100",
    iconColor: "text-amber-500",
    title: "Multas por atraso",
    desc: "A guia DAE vence dia 7. Atrasou? Multa automática. Esqueceu férias? Processo trabalhista na certa.",
  },
  {
    icon: Calculator,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "Cálculos complexos",
    desc: "INSS progressivo, IRRF, FGTS, GILRAT. Cada mês é um quebra-cabeça diferente para resolver.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-3">
          Gerenciar empregada doméstica não deveria ser um pesadelo
        </h2>
        <p className="text-muted-foreground text-lg mb-12">
          O eSocial é complexo, burocrático e cheio de armadilhas. Nós resolvemos isso para você.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <Card key={p.title} className="text-left">
              <CardContent className="pt-6">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${p.bgColor} mb-4`}>
                  <p.icon className={`w-5 h-5 ${p.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
