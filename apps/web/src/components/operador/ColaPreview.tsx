'use client'

import { Badge } from '@/components/ui/badge'
import { getPrefixColor } from '@/lib/prefix'
import type { TurnoItem } from './TurnoActualCard'

interface Props {
  cola: TurnoItem[]
}

export function ColaPreview({ cola }: Props) {
  const proximos = cola.slice(0, 5)

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold tracking-widest text-text-muted">
          EN ESPERA
        </span>
        <Badge variant="secondary">{cola.length}</Badge>
      </div>
      {proximos.length === 0 ? (
        <p className="text-center text-text-muted py-4">Sin turnos en espera</p>
      ) : (
        <ul>
          {proximos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 py-3 border-b border-border last:border-0"
            >
              <span
                className="text-2xl font-bold"
                style={{ color: getPrefixColor(t.prefijo) }}
              >
                {t.prefijo}{t.numero}
              </span>
              <span className="text-sm text-text-muted">{t.servicio.nombre}</span>
              {t.prioridad === 'preferencial' && (
                <Badge className="ml-auto bg-warning/10 text-warning border-warning/30 text-xs">
                  P
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
