'use client'

import { useState, useCallback } from 'react'
import type { UseFormSetValue } from 'react-hook-form'

export interface CepData {
  street: string
  neighborhood: string
  city: string
  state: string
}

interface AddressFields {
  street: string
  neighborhood: string
  city: string
  state: string
}

/**
 * Consulta CEP via ViaCEP e preenche campos de endereço automaticamente.
 * Versão para react-hook-form: recebe setValue e atualiza os campos diretamente.
 */
export function useCepLookup<T extends AddressFields>(setValue: UseFormSetValue<T>): (cep: string) => Promise<CepData | null>

/**
 * Consulta CEP via ViaCEP e retorna os dados de endereço.
 * Versão standalone: retorna { lookup, loading }.
 */
export function useCepLookup(): { lookup: (cep: string) => Promise<CepData | null>; loading: boolean }

export function useCepLookup<T extends AddressFields>(
  setValue?: UseFormSetValue<T>
) {
  const [loading, setLoading] = useState(false)

  const lookup = useCallback(async (cep: string): Promise<CepData | null> => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return null

    setLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) return null

      const result: CepData = {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }

      if (setValue) {
        setValue('street' as any, result.street as any)
        setValue('neighborhood' as any, result.neighborhood as any)
        setValue('city' as any, result.city as any)
        setValue('state' as any, result.state as any)
      }

      return result
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [setValue])

  // If setValue provided, return just the function (backward compatible)
  if (setValue) return lookup

  return { lookup, loading }
}
