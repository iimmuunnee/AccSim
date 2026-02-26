'use client'
import { useState, useCallback, useRef } from 'react'
import { runSimulation, getDemoData } from '@/lib/api'
import type { RunRequest, SimulationResult } from '@/lib/types'

export function useSimulator() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const run = useCallback(async (req: RunRequest) => {
    setLoading(true)
    setError(null)
    setIsFallback(false)
    try {
      const data = await runSimulation(req)
      if (data.error) {
        throw new Error(data.error)
      }
      setResult(data)
    } catch (err) {
      const fallback = getDemoData()
      setResult(fallback)
      setIsFallback(true)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const runDebounced = useCallback(
    (req: RunRequest, delay = 500) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => run(req), delay)
    },
    [run]
  )

  return { result, loading, error, isFallback, run, runDebounced }
}
