import { getIconoComponent } from '@/lib/iconos'

interface Servicio {
  id: number
  nombre: string
  prefijo: string
  icono: string
  color: string
  tiempoEstimadoSegundos: number
  activo: boolean
}

interface Props {
  servicio: Servicio
  onSelect: (servicio: Servicio) => void
  disabled?: boolean
}

export function ServicioCard({ servicio, onSelect, disabled }: Props) {
  const Icon = getIconoComponent(servicio.icono)
  return (
    <button
      onClick={() => onSelect(servicio)}
      disabled={disabled}
      className="w-full flex items-center gap-6 p-8 rounded-xl border-2 border-border text-left transition-colors hover:border-primary hover:bg-action-light disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="w-10 h-10 shrink-0" style={{ color: servicio.color }} />
      <div>
        <div className="text-xl font-semibold text-text-main">{servicio.nombre}</div>
        <div className="text-sm text-text-muted">{servicio.tiempoEstimadoSegundos} seg aprox.</div>
      </div>
    </button>
  )
}
