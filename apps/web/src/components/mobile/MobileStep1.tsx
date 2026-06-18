import { Accessibility, CheckCircle } from 'lucide-react'
import { getIconoComponent } from '@/lib/iconos'
import type { Servicio } from '@/app/totem/types'

interface Props {
  servicios: Servicio[]
  preferencial: boolean
  onTogglePreferencial: () => void
  onSelect: (s: Servicio) => void
  loading: boolean
  error: string | null
}

export default function MobileStep1({ servicios, preferencial, onTogglePreferencial, onSelect, loading, error }: Props) {
  return (
    <main className="flex-1 flex flex-col px-4 pt-6 pb-8 gap-4 max-w-sm mx-auto w-full">
      <h1 className="text-lg font-semibold text-text-main text-center mb-1">
        ¿Qué trámite deseás realizar?
      </h1>

      {servicios.map(s => {
        const Icon = getIconoComponent(s.icono)
        return (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          disabled={loading}
          className="w-full flex items-center gap-4 px-5 py-4 min-h-16 rounded-xl border-2 border-border text-left transition-colors hover:border-action hover:bg-action-light active:bg-action-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon className="w-6 h-6 shrink-0" style={{ color: s.color }} />
          <div>
            <div className="text-base font-semibold text-text-main">{s.nombre}</div>
            <div className="text-xs text-text-muted">{Math.round(s.tiempoEstimadoSegundos / 60)} min aprox.</div>
          </div>
        </button>
        )
      })}

      {error && <p className="text-danger text-sm text-center">{error}</p>}

      <div className="border-t border-border" />

      <button
        onClick={onTogglePreferencial}
        className={`w-full flex items-center gap-4 px-5 py-4 min-h-16 rounded-xl border-2 transition-colors text-left ${
          preferencial
            ? 'border-warning bg-warning text-white'
            : 'border-border hover:border-action hover:bg-action-light'
        }`}
      >
        <Accessibility className="w-6 h-6 shrink-0" />
        <div className="flex-1">
          <div className="text-base font-semibold">Atención preferencial</div>
          <div className={`text-xs ${preferencial ? 'text-white/80' : 'text-text-muted'}`}>
            Embarazadas, adultos mayores, discapacidad
          </div>
        </div>
        {preferencial && <CheckCircle className="w-5 h-5 shrink-0" />}
      </button>
    </main>
  )
}
