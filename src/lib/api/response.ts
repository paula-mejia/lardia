import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Standardized API response helpers

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function unauthorized() {
  return error('Nao autorizado', 401)
}

export function notFound(message = 'Nao encontrado') {
  return error(message, 404)
}

export function badRequest(message: string) {
  return error(message, 400)
}

export function serverError(message = 'Erro interno') {
  return error(message, 500)
}

// Auth helper: returns user and employer or an error response
export async function getAuthenticatedEmployer(fields = 'id' as const) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: unauthorized(), supabase, user: null, employer: null }
  }

  const { data: employer } = await supabase
    .from('employers')
    .select(fields)
    .eq('user_id', user.id)
    .single()

  if (!employer) {
    return { error: notFound('Empregador nao encontrado'), supabase, user, employer: null }
  }

  return { error: null, supabase, user, employer }
}
