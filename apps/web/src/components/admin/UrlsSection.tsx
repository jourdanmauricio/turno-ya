'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, Loader2, Save } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'

const RUTAS = [
  {
    path: '/totem',
    label: 'Pantalla de turnos (tótem)',
    descripcion: 'Dispositivo táctil en el local. Los clientes eligen el servicio y reciben su ticket.',
  },
  {
    path: '/display',
    label: 'Pantalla de visualización',
    descripcion: 'TV o monitor visible en la sala de espera. Muestra qué turno está siendo atendido en cada caja.',
  },
  {
    path: '/mobile',
    label: 'Web para celular (QR)',
    descripcion: 'La URL que va en el cartel QR. El cliente la abre desde su celular para sacar turno sin acercarse al tótem.',
  },
  {
    path: '/admin',
    label: 'Panel de administración',
    descripcion: 'Esta pantalla. Configuración general de la aplicación.',
  },
]

type ToastState = { msg: string; type: 'ok' | 'err' } | null

export function UrlsSection() {
  const [baseUrl, setBaseUrl] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  useEffect(() => {
    apiFetch<{ baseUrl: string }>('/configuracion')
      .then((cfg) => {
        setBaseUrl(cfg.baseUrl || (typeof window !== 'undefined' ? window.location.origin : ''))
      })
      .catch(() => {
        if (typeof window !== 'undefined') setBaseUrl(window.location.origin)
      })
  }, [])

  async function guardar() {
    setGuardando(true)
    try {
      await apiFetch('/configuracion', {
        method: 'PATCH',
        body: JSON.stringify({ baseUrl }),
      })
      showToast('URL base guardada', 'ok')
    } catch {
      showToast('Error al guardar', 'err')
    } finally {
      setGuardando(false)
    }
  }

  function copiar(path: string) {
    const url = `${baseUrl}${path}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(path)
      setTimeout(() => setCopiado(null), 2000)
    })
  }

  const base = baseUrl.replace(/\/$/, '')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-text-main">URLs de la aplicación</h2>
        <p className="text-sm text-text-muted mt-1">
          Referencia de las pantallas del sistema. Configurá el dominio base para obtener las URLs exactas.
        </p>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-xs ${
            toast.type === 'ok' ? 'bg-[#16A34A]' : 'bg-danger'
          }`}
        >
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white shrink-0">✕</button>
        </div>
      )}

      {/* Base URL input */}
      <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-main">Dominio base</h3>
        <div className="flex gap-2">
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://tu-dominio.com"
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-action font-mono"
          />
          <Button onClick={guardar} disabled={guardando} variant="outline" className="gap-2 shrink-0">
            {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Guardar
          </Button>
        </div>
        <p className="text-xs text-text-muted">
          Ej: <span className="font-mono">https://milocal.turnoya.com</span> — sin barra al final.
        </p>
      </div>

      {/* URL list */}
      <div className="flex flex-col gap-3">
        {RUTAS.map((ruta) => {
          const fullUrl = `${base}${ruta.path}`
          const isCopied = copiado === ruta.path
          return (
            <div key={ruta.path} className="bg-white border border-border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-text-main">{ruta.label}</span>
                  <span className="text-xs text-text-muted leading-snug">{ruta.descripcion}</span>
                </div>
                <button
                  onClick={() => copiar(ruta.path)}
                  title="Copiar URL"
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isCopied
                      ? 'bg-green-50 text-green-700'
                      : 'bg-bg text-text-muted hover:bg-action-light hover:text-action'
                  }`}
                >
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                  {isCopied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="bg-bg rounded-lg px-3 py-2">
                <span className="font-mono text-xs text-text-main break-all">{fullUrl}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
