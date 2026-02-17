const FEATURES = [
  { icon: '📊', title: 'Folha de pagamento', desc: 'Calcule salários com todos os descontos automaticamente.' },
  { icon: '🏖️', title: 'Férias', desc: 'Controle períodos de férias e calcule valores com precisão.' },
  { icon: '🎄', title: '13º salário', desc: 'Cálculo automático das parcelas do décimo terceiro.' },
  { icon: '📅', title: 'Calendário', desc: 'Acompanhe prazos e datas importantes do eSocial.' },
  { icon: '📄', title: 'Rescisão', desc: 'Simulação completa de rescisão contratual.' },
] as const

/**
 * Step 4: Product tour showing key LarDia features.
 */
export function StepTour() {
  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-muted-foreground text-center mb-4">
        Conheça as principais funcionalidades da LarDia:
      </p>
      {FEATURES.map(f => (
        <div key={f.title} className="flex items-start gap-3 p-3 rounded-lg border">
          <span className="text-2xl">{f.icon}</span>
          <div>
            <p className="font-medium text-sm">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
