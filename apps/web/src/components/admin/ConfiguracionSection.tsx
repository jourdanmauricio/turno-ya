'use client'

import { useState, useCallback } from 'react'
import { ConfigGeneral } from './config/ConfigGeneral'
import { SimulacionBlock } from './config/SimulacionBlock'
import { ResetBlock } from './config/ResetBlock'

type ToastState = { msg: string; type: 'ok' | 'err' } | null

export function ConfiguracionSection() {
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-text-main">Configuración</h2>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-xs ${
            toast.type === 'ok' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
          }`}
        >
          <span className="flex-1">{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="text-white/80 hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      <ConfigGeneral showToast={showToast} />
      <SimulacionBlock showToast={showToast} />
      <ResetBlock showToast={showToast} />
    </div>
  )
}
