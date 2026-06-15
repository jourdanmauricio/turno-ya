'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

interface ConfigData {
  nombreApp: string
  horarioApertura: string
  horarioCierre: string
}

interface Props {
  showToast: (msg: string, type: 'ok' | 'err') => void
}

const DEFAULTS: ConfigData = {
  nombreApp: '',
  horarioApertura: '08:00',
  horarioCierre: '18:00',
}

export function ConfigGeneral({ showToast }: Props) {
  const [form, setForm] = useState<ConfigData>(DEFAULTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiFetch<ConfigData>('/configuracion').then(setForm).catch(() => {})
  }, [])

  function set<K extends keyof ConfigData>(k: K, v: ConfigData[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function guardar() {
    setLoading(true)
    try {
      await apiFetch('/configuracion', {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      showToast('Configuración guardada', 'ok')
    } catch {
      showToast('Error al guardar la configuración', 'err')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col gap-5">
      <h3 className="font-semibold text-text-main">Configuración general</h3>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombreApp">Nombre de la app</Label>
          <Input
            id="nombreApp"
            value={form.nombreApp}
            onChange={(e) => set('nombreApp', e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apertura">Horario apertura</Label>
            <Input
              id="apertura"
              type="time"
              value={form.horarioApertura}
              onChange={(e) => set('horarioApertura', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cierre">Horario cierre</Label>
            <Input
              id="cierre"
              type="time"
              value={form.horarioCierre}
              onChange={(e) => set('horarioCierre', e.target.value)}
            />
          </div>
        </div>

      </div>

      <Button
        onClick={guardar}
        disabled={loading}
        className="self-start bg-[#1A3A6B] text-white hover:bg-[#1A3A6B]/90 rounded-md px-4 py-2 h-auto"
      >
        {loading ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </div>
  )
}
