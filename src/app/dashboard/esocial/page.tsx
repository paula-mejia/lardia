import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ESocialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id, esocial_connected, esocial_connected_at')
    .eq('user_id', user.id)
    .single()

  const isConnected = employer?.esocial_connected ?? false
  const connectedAt = employer?.esocial_connected_at
    ? new Date(employer.esocial_connected_at).toLocaleDateString('pt-BR')
    : null

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">eSocial</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie sua integracao com o eSocial
            </p>
          </div>
        </div>

        {/* Connection status card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Status da Conexao
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    Conectado
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  eSocial conectado desde {connectedAt}.
                </p>
                <Link href="/dashboard/esocial/status">
                  <Button variant="outline" className="w-full">
                    Ver status mensal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="secondary">Nao conectado</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Conecte seu eSocial para que a Lardia gerencie suas obrigacoes
                  automaticamente.
                </p>
                <Link href="/dashboard/esocial/connect">
                  <Button className="w-full">Conectar eSocial</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links when connected */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acoes rapidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/esocial/status">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Status mensal e obrigacoes
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
