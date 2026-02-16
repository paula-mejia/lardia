import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Maria S.',
    city: 'São Paulo, SP',
    text: 'Antes da LarDia eu pagava um contador so para o eSocial. Agora faco tudo sozinha em 5 minutos por mês.',
  },
  {
    name: 'Roberto L.',
    city: 'Rio de Janeiro, RJ',
    text: 'Os alertas de prazo já me salvaram de multas varias vezes. Vale cada centavo.',
  },
  {
    name: 'Ana C.',
    city: 'Belo Horizonte, MG',
    text: 'A verificação de antecedentes me deu tranquilidade para contratar. Recomendo muito.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Mais de 500 empregadores confiam na LarDia
          </h2>
          <p className="text-muted-foreground text-lg">
            Empregadores em todo o Brasil usam a LarDia para simplificar
            o eSocial doméstico e evitar dores de cabeça.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((item, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">&ldquo;{item.text}&rdquo;</p>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.city}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
