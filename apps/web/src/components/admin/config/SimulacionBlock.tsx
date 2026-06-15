'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

interface Props { showToast: (msg: string, type: 'ok' | 'err') => void }

export function SimulacionBlock({ showToast }: Props) {
  const [activa, setActiva] = useState(false)

  useEffect(() => {
    apiFetch<{ simulacionActiva: boolean }>('/configuracion')
      .then(({ simulacionActiva }) => setActiva(simulacionActiva))
      .catch(() => {})
  }, [])

  async function toggle(checked: boolean) {
    try {
      await apiFetch('/configuracion', {
        method: 'PATCH',
        body: JSON.stringify({ simulacionActiva: checked }),
      })
      setActiva(checked)
    } catch {
      showToast('Error al cambiar estado de simulación', 'err')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-text-main">Modo simulación</h3>
      <div className="flex items-center gap-3">
        <Switch id="sim-switch" checked={activa} onCheckedChange={toggle} />
        <Label htmlFor="sim-switch" className="cursor-pointer">
          Activar simulación automática
        </Label>
      </div>
      <p className={`text-sm font-medium ${activa ? 'text-[#16A34A]' : 'text-text-muted'}`}>
        {activa
          ? 'Simulación activa — atendiendo turnos automáticamente'
          : 'Simula el trabajo de los operadores en cada caja'}
      </p>
    </div>
  )
}
