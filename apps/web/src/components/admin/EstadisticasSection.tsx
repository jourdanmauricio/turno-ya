'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

interface Estadisticas {
  total: number
  esperando: number
  llamado: number
  atendido: number
  ausente: number
  tiempoPromedioMinutos: number | null
}

const EMPTY: Estadisticas = {
  total: 0, esperando: 0, llamado: 0, atendido: 0, ausente: 0, tiempoPromedioMinutos: null,
}

export function EstadisticasSection() {
  const [stats, setStats] = useState<Estadisticas>(EMPTY)
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const data = await apiFetch<Estadisticas>('/turnos/estadisticas')
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const cards = [
    { label: 'Total hoy', value: stats.total },
    { label: 'En espera', value: stats.esperando },
    { label: 'Atendidos', value: stats.atendido },
    { label: 'Ausentes', value: stats.ausente },
    {
      label: 'Tiempo promedio',
      value: stats.tiempoPromedioMinutos !== null ? `${stats.tiempoPromedioMinutos} min` : '—',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-main">Estadísticas del día</h2>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-border rounded-xl p-6 flex flex-col gap-1">
            <span className="text-sm text-text-muted">{c.label}</span>
            <span className="text-3xl font-bold text-text-main">{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
