'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'

export interface TurnoItem {
  id: number
  numero: number
  prefijo: string
  prioridad: 'normal' | 'preferencial'
  llamadoEn: string | null
  servicio: { nombre: string; color: string; tiempoEstimadoSegundos: number }
}

function useElapsedTimer(llamadoEn: string | null) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!llamadoEn) { setElapsed(0); return }
    const update = () => setElapsed(Math.floor((Date.now() - new Date(llamadoEn).getTime()) / 1000))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [llamadoEn])

  return elapsed
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function timerColor(elapsed: number, estimado: number) {
  if (elapsed < estimado) return 'text-success'
  if (elapsed < estimado * 1.25) return 'text-warning'
  return 'text-danger'
}

interface Props {
  turno: TurnoItem | null
  onAction: () => void
}

export function TurnoActualCard({ turno, onAction }: Props) {
  const elapsed = useElapsedTimer(turno?.llamadoEn ?? null)

  async function handleAtendido() {
    if (!turno) return
    await apiFetch(`/turnos/${turno.id}/atendido`, { method: 'PATCH' })
    onAction()
  }

  async function handleAusente() {
    if (!turno) return
    await apiFetch(`/turnos/${turno.id}/ausente`, { method: 'PATCH' })
    onAction()
  }

  return (
    <div className="bg-white rounded-xl border border-border p-8">
      {!turno ? (
        <p className="text-center text-text-muted text-lg py-6">Sin turno activo</p>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <span
            className="text-8xl font-black leading-none"
            style={{ color: turno.servicio.color }}
          >
            {turno.prefijo}{turno.numero}
          </span>
          <p className="text-xl text-text-muted">{turno.servicio.nombre}</p>
          {turno.prioridad === 'preferencial' && (
            <Badge className="bg-warning/10 text-warning border-warning/30">
              Preferencial
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-mono font-bold tabular-nums ${timerColor(elapsed, turno.servicio.tiempoEstimadoSegundos)}`}>
              {formatTime(elapsed)}
            </span>
            <span className="text-sm text-text-muted">
              / {formatTime(turno.servicio.tiempoEstimadoSegundos)} est.
            </span>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <Button
              className="flex-1 h-11 bg-success text-white hover:bg-success/90"
              onClick={handleAtendido}
            >
              ✓ Atendido
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-11"
              onClick={handleAusente}
            >
              ✗ Ausente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
