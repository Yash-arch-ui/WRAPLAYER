"use client"

import { useRegistry } from "@/hooks/useRegistry"

export default function Page() {
  const { pairs, loading, error } = useRegistry()

  if (loading) return <div>Loading registry...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Wrappers Registry</h1>

      {pairs.map((p) => (
        <div key={p.tokenAddress} style={{ marginBottom: 10 }}>
          <p>Token: {p.tokenAddress}</p>
          <p>Wrapper: {p.confidentialTokenAddress}</p>
        </div>
      ))}
    </div>
  )
}