'use client'
import { useEffect, useState } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import { QRCodeSVG } from 'qrcode.react'
import { Accessibility, CheckCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { ServicioCard } from '@/components/totem/ServicioCard'
import { TurnoConfirmado } from '@/components/totem/TurnoConfirmado'
import type { Servicio, Turno } from './types'

export default function TotemPage() {
  const { nombreApp } = useAppConfig()
  const [paso, setPaso] = useState<1 | 2>(1)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [turnoCreado, setTurnoCreado] = useState<Turno | null>(null)
  const [colaCount, setColaCount] = useState(0)
  const [preferencial, setPreferencial] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileUrl, setMobileUrl] = useState('/mobile')

  useEffect(() => {
    apiFetch<Servicio[]>('/servicios').then(setServicios).catch(() => setError('Error al cargar servicios'))
    setMobileUrl(`${window.location.origin}/mobile`)
  }, [])

  async function seleccionarServicio(servicio: Servicio) {
    setLoading(true); setError(null)
    try {
      const [turno, cola] = await Promise.all([
        apiFetch<Turno>('/turnos', { method: 'POST', body: JSON.stringify({ servicioId: servicio.id, prioridad: preferencial ? 'preferencial' : 'normal' }) }),
        apiFetch<Turno[]>('/turnos/cola'),
      ])
      setTurnoCreado(turno); setColaCount(cola.length); setPaso(2)
    } catch { setError('No se pudo generar el turno. Intentá de nuevo.') }
    finally { setLoading(false) }
  }

  function resetear() { setPaso(1); setTurnoCreado(null); setPreferencial(false); setError(null) }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-primary py-6 flex justify-center">
        <span className="text-3xl font-bold text-white tracking-tight">{nombreApp}</span>
      </header>
      {paso === 1 ? (
        <main className="flex-1 flex flex-col px-8 py-8">
          <h1 className="text-2xl font-semibold text-text-main text-center mt-10 mb-6">¿Qué trámite deseás realizar?</h1>
          <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
            {servicios.map(s => (
              <ServicioCard key={s.id} servicio={s} onSelect={seleccionarServicio} disabled={loading} />
            ))}
            {error && <p className="text-danger text-sm text-center">{error}</p>}
            <div className="border-t border-border my-2" />
            <button onClick={() => setPreferencial(p => !p)}
              className={`w-full flex items-center gap-6 p-6 rounded-xl border-2 transition-colors text-left ${preferencial ? 'border-warning bg-warning text-white' : 'border-border hover:border-primary hover:bg-action-light'}`}>
              <Accessibility className="w-10 h-10 shrink-0" />
              <div className="flex-1">
                <div className="text-xl font-semibold">Atención preferencial</div>
                <div className={`text-sm ${preferencial ? 'text-white/80' : 'text-text-muted'}`}>Embarazadas, adultos mayores, discapacidad</div>
              </div>
              {preferencial && <CheckCircle className="w-6 h-6 shrink-0" />}
            </button>
          </div>
          <div className="mt-auto pt-8 flex flex-col items-center gap-2">
            <QRCodeSVG value={mobileUrl} size={80} />
            <p className="text-xs text-text-muted text-center max-w-xs">O escaneá para sacar tu turno desde tu celular</p>
          </div>
        </main>
      ) : turnoCreado ? (
        <TurnoConfirmado turno={turnoCreado} colaCount={colaCount} onNuevo={resetear} />
      ) : null}
    </div>
  )
}
