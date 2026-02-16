'use client'

import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

/**
 * Hook genérico para chamadas de API com estados de loading, erro e dados.
 *
 * @param fetchFn - Função assíncrona que realiza a chamada
 */
export function useApi<T>(
  fetchFn: (...args: unknown[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: false,
  })

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState({ data: null, error: null, loading: true })
      try {
        const data = await fetchFn(...args)
        setState({ data, error: null, loading: false })
        return data
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro desconhecido'
        setState({ data: null, error: message, loading: false })
        return null
      }
    },
    [fetchFn]
  )

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false })
  }, [])

  return { ...state, execute, reset }
}
