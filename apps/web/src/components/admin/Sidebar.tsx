'use client'

import { Button } from '@/components/ui/button'
import { useAppConfig } from '@/context/AppConfigContext'

type Seccion = 'operadores' | 'servicios' | 'cajas' | 'estadisticas' | 'configuracion' | 'cartel-qr' | 'urls'

interface SidebarProps {
  seccion: Seccion
  onSeccion: (s: Seccion) => void
  nombre: string
  onLogout: () => void
}

const SECCIONES: { id: Seccion; label: string }[] = [
  // { id: 'operadores', label: 'Operadores' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'cajas', label: 'Cajas' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'configuracion', label: 'Configuración' },
  { id: 'cartel-qr', label: 'Cartel QR' },
  { id: 'urls', label: 'URLs' },
]

export function Sidebar({ seccion, onSeccion, nombre, onLogout }: SidebarProps) {
  const { nombreApp } = useAppConfig()
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-border flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-border">
        <span className="text-primary font-bold text-xl">{nombreApp}</span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {SECCIONES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSeccion(s.id)}
            className={
              seccion === s.id
                ? 'w-full text-left px-3 py-2 rounded-lg bg-action-light text-action font-semibold text-sm'
                : 'w-full text-left px-3 py-2 rounded-lg text-text-muted hover:bg-bg text-sm transition-colors'
            }
          >
            {s.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <p className="text-sm text-text-main font-medium mb-2 truncate">{nombre}</p>
        <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
