'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'
import { getPrefixColor } from '@/lib/prefix'

export interface TurnoItem {
  id: number
  numero: number
  prefijo: string
  prioridad: 'normal' | 'preferencial'
  servicio: { nombre: string }
}

interface Props {
  turno: TurnoItem | null
  onAction: () => void
}

export function TurnoActualCard({ turno, onAction }: Props) {
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
            style={{ color: getPrefixColor(turno.prefijo) }}
          >
            {turno.prefijo}{turno.numero}
          </span>
          <p className="text-xl text-text-muted">{turno.servicio.nombre}</p>
          {turno.prioridad === 'preferencial' && (
            <Badge className="bg-warning/10 text-warning border-warning/30">
              Preferencial
            </Badge>
          )}
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
