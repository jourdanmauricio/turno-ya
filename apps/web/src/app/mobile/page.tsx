'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import type { Servicio, Turno } from '@/app/totem/types'
import MobileStep1 from '@/components/mobile/MobileStep1'
import MobileStep2 from '@/components/mobile/MobileStep2'
import { useAppConfig } from '@/context/AppConfigContext'

export default function MobilePage() {
  const { nombreApp } = useAppConfig()
  const [paso, setPaso] = useState<1 | 2>(1)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [turnoCreado, setTurnoCreado] = useState<Turno | null>(null)
  const [colaCount, setColaCount] = useState(0)
  const [preferencial, setPreferencial] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Servicio[]>('/servicios')
      .then(setServicios)
      .catch(() => setError('Error al cargar servicios'))
  }, [])

  async function seleccionarServicio(servicio: Servicio) {
    setLoading(true); setError(null)
    try {
      const [turno, cola] = await Promise.all([
        apiFetch<Turno>('/turnos', {
          method: 'POST',
          body: JSON.stringify({ servicioId: servicio.id, prioridad: preferencial ? 'preferencial' : 'normal' }),
        }),
        apiFetch<Turno[]>('/turnos/cola'),
      ])
      setTurnoCreado(turno); setColaCount(cola.length); setPaso(2)
    } catch {
      setError('No se pudo generar el turno. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function resetear() {
    setPaso(1); setTurnoCreado(null); setPreferencial(false); setError(null)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-primary py-5 flex justify-center">
        <span className="text-2xl font-bold text-white tracking-tight">{nombreApp}</span>
      </header>

      {paso === 1 ? (
        <MobileStep1
          servicios={servicios}
          preferencial={preferencial}
          onTogglePreferencial={() => setPreferencial(p => !p)}
          onSelect={seleccionarServicio}
          loading={loading}
          error={error}
        />
      ) : turnoCreado ? (
        <MobileStep2 turno={turnoCreado} colaCount={colaCount} onNuevo={resetear} />
      ) : null}
    </div>
  )
}
