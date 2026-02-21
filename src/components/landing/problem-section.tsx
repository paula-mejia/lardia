import { AlertTriangle, Clock, Calculator } from "lucide-react";

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
    <section className="py-24 px-4 bg-muted/40">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Gerenciar empregada doméstica não deveria ser um pesadelo
        </h2>
        <p className="text-muted-foreground text-lg sm:text-xl mb-16 max-w-3xl mx-auto">
          O eSocial é complexo, burocrático e cheio de armadilhas. Nós resolvemos isso para você.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl border border-gray-200 p-8 text-left shadow-sm">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${p.bgColor} mb-6`}>
                <p.icon className={`w-7 h-7 ${p.iconColor}`} />
              </div>
              <h3 className="font-bold text-xl mb-3">{p.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
