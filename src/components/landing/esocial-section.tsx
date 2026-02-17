import { UserPlus, ClipboardList, ShieldCheck, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    title: "Cadastre-se",
    desc: "Crie sua conta gratuita em menos de 2 minutos. Sem cartão de crédito.",
  },
  {
    icon: ClipboardList,
    title: "Registre seu empregado",
    desc: "Informe os dados básicos: nome, CPF, salário e data de admissão.",
  },
  {
    icon: ShieldCheck,
    title: "Conecte o eSocial",
    desc: "Autorize a LarDia via procuração eletrônica no eCAC. Processo guiado, 100% digital.",
  },
  {
    icon: Coffee,
    title: "Relaxe",
    desc: "A LarDia cuida do resto: folha, DAE, prazos e contracheques no piloto automático.",
  },
];

export default function EsocialSection() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-3">Como funciona</h2>
        <p className="text-muted-foreground text-lg mb-12">
          Em 4 passos simples, você nunca mais se preocupa com o eSocial.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {steps.map((step, i) => (
            <Card key={step.title} className="text-left relative">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">
                  {i + 1}
                </div>
                <div className="mb-3">
                  <step.icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Cadastre-se → Registre → Conecte → Relaxe
        </p>
        <Button asChild size="lg" className="bg-black text-white hover:bg-black/90">
          <Link href="/signup">Começar agora — é grátis →</Link>
        </Button>
      </div>
    </section>
  );
}
