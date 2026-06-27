"use client"

import { useEffect, useState } from "react";
import { getRegistryPairs } from "@/lib/registry"

export type TokenPair = {
  tokenAddress: `0x${string}`
  confidentialTokenAddress: `0x${string}`
  isValid: boolean
}

export function useRegistry() {
  const [pairs, setPairs] = useState<TokenPair[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getRegistryPairs()
        setPairs(data)
      } catch (err: any) {
        setError(err.message || "Failed to load registry")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { pairs, loading, error }
}