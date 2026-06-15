'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { apiFetch } from '@/lib/api'

interface Caja {
  id: number
  numero: number
  activo: boolean
}

const btnToggle = (activo: boolean) =>
  activo
    ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 h-auto'
    : 'bg-[#16A34A] text-white hover:bg-[#16A34A]/90 rounded-md px-4 py-2 h-auto'

export function CajasSection() {
  const [cajas, setCajas] = useState<Caja[]>([])

  async function fetchData() {
    const data = await apiFetch<Caja[]>('/cajas/admin')
    setCajas(data)
  }

  useEffect(() => { fetchData() }, [])

  async function toggleActivo(c: Caja) {
    await apiFetch(`/cajas/${c.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo: !c.activo }),
    })
    fetchData()
  }

  async function crearCaja() {
    await apiFetch('/cajas', { method: 'POST' })
    fetchData()
  }

  const atLimit = cajas.length >= 10

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-main">Cajas</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={crearCaja}
                  disabled={atLimit}
                  className="bg-primary text-white hover:bg-primary/90 rounded-md px-4 py-2 h-auto disabled:pointer-events-none"
                >
                  ＋ Agregar caja
                </Button>
              </span>
            </TooltipTrigger>
            {atLimit && (
              <TooltipContent>Límite de cajas alcanzado</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cajas.map((c) => (
          <div key={c.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-main text-lg">Caja {c.numero}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.activo ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {c.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <Button
              variant={c.activo ? 'outline' : 'default'}
              onClick={() => toggleActivo(c)}
              className={btnToggle(c.activo)}
            >
              {c.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
