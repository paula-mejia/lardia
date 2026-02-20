import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "./faq-accordion";
import NewsletterSignup from "@/components/newsletter-signup";

export const metadata: Metadata = {
  title: "Perguntas Frequentes | LarDia - eSocial Doméstico",
  description:
    "Tire todas as suas dúvidas sobre eSocial doméstico, DAE, FGTS, INSS, férias, 13º salário e rescisão. Guia completo para empregadores domésticos no Brasil.",
  keywords: [
    "eSocial doméstico",
    "DAE",
    "empregada doméstica",
    "FGTS doméstico",
    "INSS doméstico",
    "férias empregada doméstica",
    "13 salário doméstica",
    "rescisão doméstica",
    "LC 150/2015",
  ],
};

// All FAQ data organized by category
const faqCategories = [
  {
    title: "Sobre o eSocial Doméstico",
    items: [
      {
        question: "O que é o eSocial doméstico?",
        answer:
          "O eSocial doméstico é o sistema do Governo Federal que unifica o envio de informações trabalhistas, previdenciárias e fiscais dos empregadores domésticos. Criado pela Lei Complementar 150/2015, ele simplifica o cumprimento das obrigações legais ao reunir tudo em uma única plataforma. Todo empregador que contrata trabalhadores domésticos com carteira assinada precisa usar o eSocial para registrar admissões, folha de pagamento, férias, 13º e demais eventos.",
      },
      {
        question: "Quem precisa declarar no eSocial?",
        answer:
          "Todo empregador doméstico que contrata um trabalhador com vínculo empregatício precisa declarar no eSocial. Isso inclui quem emprega empregadas domésticas, cozinheiros, motoristas, jardineiros, cuidadores e outros profissionais que trabalham no ambiente residencial. Se o trabalhador presta serviço mais de duas vezes por semana na mesma residência, a relação de emprego já está configurada conforme a LC 150/2015.",
      },
      {
        question: "O que acontece se eu não declarar no eSocial?",
        answer:
          "O empregador que não declarar no eSocial está sujeito a multas que variam de R$ 402,53 a R$ 805,06 por empregado não registrado, conforme o artigo 47 da CLT. Além disso, o não recolhimento do FGTS e INSS gera encargos adicionais com juros e correção monetária. O trabalhador também pode entrar com uma ação trabalhista, o que costuma resultar em valores muito maiores do que o custo de manter tudo regularizado.",
      },
      {
        question: "Como me cadastro no eSocial como empregador doméstico?",
        answer:
          "Para se cadastrar, acesse o portal esocial.gov.br e faça login com sua conta Gov.br (nível prata ou ouro). O sistema irá solicitar seus dados pessoais, CPF e endereço. Após o cadastro, você já pode registrar seus empregados e começar a enviar as declarações mensais. Caso tenha dificuldade com o Gov.br, é possível criar a conta em qualquer agência do INSS ou dos Correios.",
      },
      {
        question: "Qual o prazo para registrar uma empregada no eSocial?",
        answer:
          "O registro no eSocial deve ser feito até um dia antes do início efetivo do trabalho. Essa regra está prevista na LC 150/2015 e é fundamental para garantir a cobertura previdenciária desde o primeiro dia. Se você registrar após o início do trabalho, poderá ser multado e ainda terá que regularizar os recolhimentos retroativos de FGTS e INSS.",
      },
      {
        question: "Preciso de contador para o eSocial doméstico?",
        answer:
          "Não é obrigatório ter um contador para o eSocial doméstico, mas muitos empregadores preferem ter ajuda profissional para evitar erros. O sistema foi desenhado para ser acessível a pessoas físicas, porém os cálculos de encargos, férias e rescisão podem ser complexos. A LarDia foi criada justamente para resolver isso: você tem a precisão de um contador com a simplicidade de um aplicativo.",
      },
      {
        question: "O que mudou no eSocial em 2026?",
        answer:
          "Em 2026, o eSocial passou por atualizações no layout simplificado (S-1.3), incluindo novos campos para eventos de saúde e segurança do trabalho doméstico. O salário mínimo foi reajustado, impactando diretamente os cálculos de encargos. Além disso, o sistema agora permite a retificação simplificada de eventos anteriores, facilitando a correção de erros sem necessidade de exclusão completa do evento original.",
      },
      {
        question: "Como corrijo um erro no eSocial?",
        answer:
          "Para corrigir um erro, você precisa enviar um evento de retificação pelo próprio portal do eSocial. Acesse o evento com erro, clique em 'Retificar' e envie os dados corretos. É importante fazer a correção o mais rápido possível, pois erros em valores de remuneração afetam o cálculo da DAE. Se a DAE já foi paga com valor incorreto, será necessário gerar uma DAE complementar ou solicitar restituição.",
      },
    ],
  },
  {
    title: "Sobre a DAE",
    items: [
      {
        question: "O que é a DAE?",
        answer:
          "A DAE (Documento de Arrecadação do eSocial) é a guia única de pagamento que reúne todos os tributos e encargos do empregador doméstico. Ela substitui várias guias avulsas que existiam antes da LC 150/2015, como GPS e GRF. Com a DAE, você paga INSS patronal, INSS do empregado, FGTS, seguro contra acidentes e antecipação da multa rescisória, tudo em um só boleto.",
      },
      {
        question: "Quando vence a DAE?",
        answer:
          "A DAE vence no dia 7 de cada mês, referente à competência do mês anterior. Se o dia 7 cair em fim de semana ou feriado, o vencimento é antecipado para o último dia útil anterior. Por exemplo, a DAE referente a janeiro de 2026 vence em 6 de fevereiro (já que 7/02 é sábado). É fundamental pagar dentro do prazo para evitar multas e juros.",
      },
      {
        question: "O que compõe a DAE?",
        answer:
          "A DAE é composta por: INSS patronal (8%), INSS do empregado (7,5% a 14%, conforme faixa salarial), FGTS (8%), seguro contra acidentes de trabalho/GILRAT (0,8%) e antecipação da multa rescisória do FGTS (3,2%). Todos esses percentuais são calculados sobre o salário bruto do empregado. No total, o empregador doméstico arca com cerca de 20% de encargos sobre o salário.",
      },
      {
        question: "Como gero a DAE?",
        answer:
          "Para gerar a DAE, acesse o portal do eSocial (esocial.gov.br), vá em 'Empregado Doméstico' e clique em 'Folha/Recebimentos e Pagamentos'. Após conferir os valores da folha de pagamento do mês, feche a folha e clique em 'Emitir DAE'. O sistema gerará um boleto com código de barras. Com a LarDia, esse processo é automatizado: a folha é calculada e a DAE fica pronta para pagamento com um clique.",
      },
      {
        question: "O que acontece se atrasar a DAE?",
        answer:
          "O atraso no pagamento da DAE gera multa de 0,33% ao dia sobre o valor do INSS, limitada a 20%, além de juros equivalentes à taxa Selic. Para o FGTS, a multa é de 5% no primeiro mês de atraso e 10% a partir do segundo mês, mais juros de 0,5% ao mês. Atrasos recorrentes podem gerar pendências no CPF do empregador junto à Receita Federal.",
      },
      {
        question: "Posso pagar a DAE por PIX?",
        answer:
          "Sim, desde 2023 é possível pagar a DAE por PIX usando o QR Code que aparece na própria guia gerada pelo eSocial. Basta abrir o aplicativo do seu banco, escanear o código e confirmar o pagamento. A compensação é imediata, diferente do boleto bancário que pode levar até dois dias úteis. Essa é a forma mais rápida e prática de quitar a DAE.",
      },
    ],
  },
  {
    title: "Sobre salário e encargos",
    items: [
      {
        question: "Qual o salário mínimo para empregada doméstica em 2026?",
        answer:
          "O salário mínimo nacional em 2026 é de R$ 1.621,00 (Decreto D12797). Esse é o valor mínimo que deve ser pago a uma empregada doméstica que trabalha em jornada integral (44 horas semanais). Alguns estados possuem pisos regionais superiores ao mínimo nacional, como São Paulo (R$ 1.640,00) e Rio de Janeiro. Sempre verifique o piso do seu estado antes de definir o salário.",
      },
      {
        question: "Como calcular o INSS da empregada doméstica?",
        answer:
          "O INSS do empregado doméstico segue a tabela progressiva: 7,5% até R$ 1.621,00; 9% de R$ 1.621,01 a R$ 2.902,84; 12% de R$ 2.902,85 a R$ 4.354,27; e 14% de R$ 4.354,28 a R$ 8.475,55. O cálculo é feito por faixa, similar ao Imposto de Renda. Já o INSS patronal é fixo em 8% sobre o salário bruto, pago pelo empregador através da DAE.",
      },
      {
        question: "Como funciona o FGTS da empregada doméstica?",
        answer:
          "O FGTS da empregada doméstica corresponde a 8% do salário bruto, depositado mensalmente pelo empregador através da DAE. Esse valor vai para uma conta vinculada ao trabalhador na Caixa Econômica Federal. Além dos 8%, o empregador doméstico também recolhe 3,2% como antecipação da multa rescisória (equivalente aos 40% do FGTS em caso de demissão sem justa causa), conforme a LC 150/2015.",
      },
      {
        question: "O que é o GILRAT?",
        answer:
          "GILRAT significa Grau de Incidência de Incapacidade Laborativa decorrente dos Riscos Ambientais do Trabalho. Para o empregador doméstico, a alíquota é fixa em 0,8% sobre o salário bruto do empregado. Esse valor é recolhido mensalmente junto com a DAE e serve para financiar benefícios previdenciários relacionados a acidentes de trabalho e doenças ocupacionais do trabalhador doméstico.",
      },
      {
        question: "Empregada doméstica paga Imposto de Renda?",
        answer:
          "Depende do salário. Se a remuneração mensal ultrapassar a faixa de isenção do IRPF (R$ 2.824,00 em 2026, considerando o desconto simplificado), o empregado doméstico estará sujeito à retenção do Imposto de Renda na fonte. O empregador é responsável por fazer o desconto e informar no eSocial. Na prática, a maioria dos empregados domésticos que recebem até dois salários mínimos está isenta.",
      },
      {
        question: "Quanto custa uma empregada doméstica no total?",
        answer:
          "Considerando o salário mínimo de R$ 1.621,00 em 2026, o custo total mensal para o empregador fica em torno de R$ 1.945,20. Isso inclui os 8% de FGTS (R$ 129,68), 8% de INSS patronal (R$ 129,68), 0,8% de GILRAT (R$ 12,97) e 3,2% de antecipação da multa do FGTS (R$ 51,87). Somando vale-transporte e provisão para férias e 13º, o custo real pode ultrapassar R$ 2.400,00 por mês.",
      },
    ],
  },
  {
    title: "Sobre férias, 13º e rescisão",
    items: [
      {
        question: "Como calcular férias da empregada doméstica?",
        answer:
          "As férias da empregada doméstica seguem as mesmas regras da CLT: após 12 meses de trabalho (período aquisitivo), o empregado tem direito a 30 dias de descanso remunerado. O valor é o salário integral acrescido de 1/3 constitucional. Por exemplo, com salário de R$ 1.621,00, as férias totalizam R$ 2.161,33 (salário + R$ 540,33 de terço). O pagamento deve ser feito até dois dias antes do início das férias.",
      },
      {
        question: "A empregada pode vender férias?",
        answer:
          "Sim, a empregada doméstica pode converter 1/3 das férias (10 dias) em abono pecuniário, o que é popularmente chamado de 'vender férias'. Essa solicitação deve partir do empregado e ser feita por escrito até 15 dias antes do término do período aquisitivo, conforme o artigo 143 da CLT. O empregador não pode obrigar o empregado a vender férias, nem recusar o pedido se feito no prazo correto.",
      },
      {
        question: "Como calcular o 13º salário?",
        answer:
          "O 13º salário corresponde a 1/12 do salário por mês trabalhado no ano. Se a empregada trabalhou o ano inteiro, recebe um salário integral. O pagamento é feito em duas parcelas: a primeira entre 1º de fevereiro e 30 de novembro (sem descontos), e a segunda até 20 de dezembro (com desconto de INSS e IR, se aplicável). Para quem trabalhou menos de 12 meses, o valor é proporcional aos meses trabalhados.",
      },
      {
        question: "Quais os tipos de demissão?",
        answer:
          "Existem quatro tipos principais de demissão para empregados domésticos: sem justa causa (empregador demite sem motivo), por justa causa (falta grave do empregado, conforme art. 27 da LC 150/2015), pedido de demissão (o empregado pede para sair) e rescisão por acordo mútuo (introduzida pela Reforma Trabalhista). Cada tipo tem regras diferentes para aviso prévio, multa do FGTS e saque do fundo de garantia.",
      },
      {
        question: "O que é aviso prévio proporcional?",
        answer:
          "O aviso prévio proporcional é um acréscimo de 3 dias por ano trabalhado, somado aos 30 dias do aviso prévio base. Por exemplo, um empregado com 5 anos de casa tem direito a 45 dias de aviso prévio (30 + 15). O limite máximo é de 90 dias (30 anos de trabalho). Essa regra vale para demissões sem justa causa e está prevista na Lei 12.506/2011, aplicável também aos empregados domésticos.",
      },
      {
        question: "Como calcular a multa do FGTS na demissão?",
        answer:
          "Na demissão sem justa causa, o empregado doméstico tem direito a uma multa de 40% sobre o saldo total do FGTS. No entanto, como o empregador doméstico já recolhe 3,2% mensalmente como antecipação dessa multa (via DAE), o valor acumulado nessa conta específica é usado para compor os 40%. Se o valor acumulado for insuficiente, o empregador não precisa complementar, pois a LC 150/2015 limitou a multa ao montante depositado na conta de 3,2%.",
      },
    ],
  },
  {
    title: "Dúvidas mais comuns sobre empregada doméstica",
    items: [
      {
        question: "Qual o salário mínimo para empregada doméstica em 2026?",
        answer:
          "O salário mínimo para empregada doméstica em 2026 é de R$ 1.621,00 para jornada integral de 44 horas semanais, conforme o Decreto D12797 e o Art. 7º, IV da Constituição Federal. Alguns estados possuem pisos regionais superiores: São Paulo (R$ 1.640,00), Paraná (R$ 1.856,94) e Santa Catarina (R$ 1.612,00). O empregador deve pagar o maior valor entre o mínimo nacional e o piso estadual. Para jornada parcial (até 25h/semana), o salário pode ser proporcional.",
      },
      {
        question: "Quanto o empregador paga de INSS sobre empregada doméstica?",
        answer:
          "O empregador doméstico paga 8% de INSS patronal sobre o salário bruto do empregado, conforme o Art. 34 da LC 150/2015. Com o salário mínimo de R$ 1.621,00, isso equivale a R$ 129,68 por mês. Esse valor é pago pelo empregador (não desconta do salário) e é recolhido junto com a DAE. Além disso, o empregado tem desconto de 7,5% a 14% de INSS conforme tabela progressiva.",
      },
      {
        question: "Como funciona o FGTS da empregada doméstica?",
        answer:
          "O FGTS da empregada doméstica é de 8% do salário bruto, depositado mensalmente pelo empregador via DAE em conta vinculada na Caixa Econômica Federal, conforme o Art. 22 da LC 150/2015. Além dos 8%, o empregador paga 3,2% de antecipação da multa rescisória (que substitui os 40% de multa do FGTS em caso de demissão sem justa causa). Com salário de R$ 1.621,00: FGTS = R$ 129,68 + antecipação = R$ 51,87, totalizando R$ 181,55/mês.",
      },
      {
        question: "O que acontece se não pagar o eSocial doméstico?",
        answer:
          "Não pagar o eSocial doméstico (DAE) gera multas e juros: o INSS tem multa de 0,33% ao dia (máximo 20%) mais juros Selic, e o FGTS tem multa de 5% no primeiro mês e 10% a partir do segundo, mais 0,5% de juros ao mês. Além disso, o empregador não registrado está sujeito a multa de R$ 402,53 a R$ 805,06 por empregado (Art. 47 da CLT). Atrasos recorrentes podem gerar pendências no CPF junto à Receita Federal e o trabalhador pode mover ação trabalhista.",
      },
      {
        question: "Empregada doméstica tem direito a 13º salário?",
        answer:
          "Sim, a empregada doméstica tem direito ao 13º salário integral, conforme o Art. 7º, VIII da Constituição Federal e a Lei 4.090/1962. O valor corresponde a 1/12 da remuneração por mês trabalhado no ano. É pago em duas parcelas: a primeira entre 1º de fevereiro e 30 de novembro (sem descontos), e a segunda até 20 de dezembro (com desconto de INSS e IRRF, se aplicável). Com salário de R$ 1.621,00 e ano completo, o 13º é de R$ 1.621,00.",
      },
      {
        question: "Como calcular férias da empregada doméstica?",
        answer:
          "As férias da empregada doméstica são calculadas somando o salário bruto ao 1/3 constitucional (Art. 7º, XVII da CF e Art. 17 da LC 150/2015). Com salário de R$ 1.621,00: férias = R$ 1.621,00 + R$ 540,33 (1/3) = R$ 2.161,33 brutos. Desconta-se INSS progressivo (R$ 170,19), resultando em R$ 1.991,01 líquidos. O pagamento deve ser feito até 2 dias antes do início das férias (Art. 145 da CLT). O período é de 30 dias após 12 meses de trabalho.",
      },
      {
        question: "Qual o prazo para pagar o DAE?",
        answer:
          "A DAE (Documento de Arrecadação do eSocial) vence no dia 7 de cada mês, referente à competência do mês anterior, conforme o Art. 35 da LC 150/2015. Se o dia 7 cair em sábado, domingo ou feriado, o vencimento é antecipado para o último dia útil anterior. A DAE pode ser paga por boleto bancário ou PIX (QR Code disponível na própria guia). O atraso gera multa de 0,33% ao dia sobre o INSS e 5% a 10% sobre o FGTS.",
      },
      {
        question: "Empregada doméstica pode trabalhar aos sábados?",
        answer:
          "Sim, a empregada doméstica pode trabalhar aos sábados. A jornada legal é de 44 horas semanais e 8 horas diárias (Art. 2º da LC 150/2015), o que geralmente se distribui em 8 horas de segunda a sexta (40h) mais 4 horas no sábado. O empregador e o empregado podem acordar compensação de horas para folgar no sábado, desde que não ultrapasse 10 horas diárias. O domingo é o descanso semanal remunerado obrigatório (Art. 16 da LC 150/2015).",
      },
      {
        question: "Como fazer rescisão de empregada doméstica?",
        answer:
          "Para fazer a rescisão, registre o desligamento no eSocial informando a data e o motivo (sem justa causa, justa causa, pedido de demissão ou acordo mútuo). Na demissão sem justa causa, o empregado tem direito a: saldo de salário, aviso prévio (30 dias + 3 por ano trabalhado, Art. 23 da LC 150/2015), férias proporcionais + 1/3, 13º proporcional, saque do FGTS e multa de 40% (já antecipada nos 3,2% mensais), além de 3 parcelas de seguro-desemprego (Art. 26 da LC 150/2015). O prazo para pagar as verbas rescisórias é de 10 dias corridos após o término do contrato.",
      },
      {
        question: "Preciso de contador para o eSocial doméstico?",
        answer:
          "Não é obrigatório ter contador para o eSocial doméstico. O sistema foi criado para ser usado diretamente por pessoas físicas. Porém, os cálculos de encargos, férias, 13º e rescisão podem ser complexos e erros geram multas. Muitos empregadores contratam contadores (R$ 150 a R$ 300/mês) ou usam plataformas como a LarDia (a partir de R$ 49,90/mês) que automatizam todos os cálculos com base na LC 150/2015 e na CLT, eliminando a necessidade de um profissional contábil.",
      },
    ],
  },
  {
    title: "Sobre a LarDia",
    items: [
      {
        question: "O que é a LarDia?",
        answer:
          "A LarDia é uma plataforma que automatiza toda a gestão do eSocial doméstico para empregadores. Com a LarDia, você calcula folha de pagamento, gera a DAE, controla férias, 13º salário e rescisões com precisão total. Nossa missão é eliminar a complexidade burocrática para que você não precise ser especialista em legislação trabalhista para manter tudo em dia.",
      },
      {
        question: "Quanto custa a LarDia?",
        answer:
          "A LarDia oferece planos a partir de R$ 49,90 por mês por empregado. Esse valor inclui cálculo automático da folha, geração da DAE, controle de férias e 13º, alertas de prazos e suporte especializado. Comparado ao custo de um contador (que cobra entre R$ 150 e R$ 300 por mês), a LarDia é significativamente mais acessível e ainda oferece mais praticidade no dia a dia.",
      },
      {
        question: "A LarDia substitui um contador?",
        answer:
          "Para a maioria dos empregadores domésticos, sim. A LarDia faz todos os cálculos trabalhistas e previdenciários com base na legislação vigente (LC 150/2015, CLT e normas da Receita Federal). No entanto, em situações muito específicas, como ações trabalhistas ou planejamento tributário complexo, pode ser recomendável consultar um profissional. A LarDia cuida do operacional para que você só precise de um contador em casos excepcionais.",
      },
      {
        question: "Como funciona a verificação de antecedentes?",
        answer:
          "A LarDia oferece um serviço de verificação de antecedentes para ajudar na contratação segura de empregados domésticos. O processo consulta bases públicas de dados, incluindo antecedentes criminais, situação do CPF e pendências judiciais. O resultado é entregue em até 24 horas, de forma confidencial. Tudo é feito em conformidade com a LGPD, com consentimento prévio do candidato.",
      },
      {
        question: "Meus dados estão seguros?",
        answer:
          "Sim. A LarDia utiliza criptografia de ponta a ponta e segue todas as diretrizes da Lei Geral de Proteção de Dados (LGPD). Seus dados pessoais e os de seus empregados são armazenados em servidores seguros com certificação SOC 2. Nunca compartilhamos informações com terceiros sem seu consentimento explícito e você pode solicitar a exclusão dos seus dados a qualquer momento.",
      },
    ],
  },
];

// Build JSON-LD structured data for SEO
const allQuestions = faqCategories.flatMap((cat) => cat.items);
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allQuestions.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LarDia
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="text-sm font-medium text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Comece agora</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b bg-gradient-to-br from-emerald-50 via-background to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa saber sobre eSocial doméstico, DAE,
            encargos, férias, 13o e muito mais.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {faqCategories.map((category) => (
          <div key={category.title} className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {category.title}
            </h2>
            <FaqAccordion items={category.items} />
          </div>
        ))}
      </section>

      {/* Newsletter */}
      <NewsletterSignup source="faq" />

      {/* CTA */}
      <section className="border-t bg-emerald-50 dark:bg-emerald-950/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ainda tem duvidas? A LarDia resolve para você
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Cadastre-se e deixe a burocracia do eSocial doméstico com a gente.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Comece agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-muted-foreground">
            &copy; 2026 LarDia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
