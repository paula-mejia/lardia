import PayrollCalculator from "@/components/payroll-calculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Lardia
          </h1>
          <p className="text-muted-foreground">
            eSocial sem erro, sem estresse
          </p>
        </div>

        {/* Calculator */}
        <PayrollCalculator />

        {/* Footer */}
        <footer className="text-center mt-12 text-xs text-muted-foreground">
          <p>Valores calculados com base nas tabelas de 2026.</p>
          <p className="mt-1">
            INSS, FGTS e IRRF atualizados conforme legislação vigente.
          </p>
        </footer>
      </div>
    </main>
  );
}
