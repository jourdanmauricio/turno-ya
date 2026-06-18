'use client'

import { useEffect, useState } from 'react'

export interface CajaEstado {
  cajaId: number
  cajaNumero: number
  turnoActual: {
    numero: number
    prefijo: string
    color: string
    llamadoEn: string | null
    tiempoEstimadoSegundos: number
  } | null
}

export interface ColaItem {
  id: number
  numero: number
  prefijo: string
  prioridad: 'normal' | 'preferencial'
  servicio: { color: string }
}

function useElapsedTimer(llamadoEn: string | null) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!llamadoEn) { setElapsed(0); return }
    const update = () => setElapsed(Math.floor((Date.now() - new Date(llamadoEn).getTime()) / 1000))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [llamadoEn])
  return elapsed
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function timerColor(elapsed: number, estimado: number) {
  if (elapsed < estimado) return '#16a34a'
  if (elapsed < estimado * 1.25) return '#ca8a04'
  return '#dc2626'
}

function CajaCard({ caja, pulsating, bouncing }: {
  caja: CajaEstado
  pulsating: boolean
  bouncing: boolean
}) {
  const elapsed = useElapsedTimer(caja.turnoActual?.llamadoEn ?? null)
  const estimado = caja.turnoActual?.tiempoEstimadoSegundos ?? 0

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-border p-6 gap-2${pulsating ? ' animate-pulse bg-primary/5 border-primary/30' : ''}`}
    >
      <span className="text-2xl font-bold tracking-widest text-text-muted uppercase">
        Caja {caja.cajaNumero}
      </span>
      <span
        className={`text-8xl font-black leading-none${bouncing ? ' animate-bounce' : ''}`}
        style={{ color: caja.turnoActual!.color }}
      >
        {caja.turnoActual!.prefijo}{caja.turnoActual!.numero}
      </span>
      {caja.turnoActual?.llamadoEn && (
        <span
          className="text-2xl font-mono font-bold tabular-nums"
          style={{ color: timerColor(elapsed, estimado) }}
        >
          {formatTime(elapsed)} / {formatTime(estimado)}
        </span>
      )}
    </div>
  )
}

interface Props {
  cajasEstado: CajaEstado[]
  cola: ColaItem[]
  pulsatingCajaNumero?: number | null
  bouncingCajaNumero?: number | null
}

export default function TurnosPanel({ cajasEstado, cola, pulsatingCajaNumero, bouncingCajaNumero }: Props) {
  const cajasActivas = cajasEstado.filter((c) => c.turnoActual !== null)

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">

      <p className="text-xl font-bold tracking-widest text-primary px-6 pt-3 pb-2 border-b border-border uppercase shrink-0">
        En Atención
      </p>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden content-start">
        {cajasActivas.length === 0 ? (
          <p className="col-span-2 text-text-muted text-2xl px-2 py-4">Sin turnos en atención</p>
        ) : (
          cajasActivas.map((caja) => (
            <CajaCard
              key={caja.cajaId}
              caja={caja}
              pulsating={pulsatingCajaNumero === caja.cajaNumero}
              bouncing={bouncingCajaNumero === caja.cajaNumero}
            />
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-border">
        <p className="text-xl font-bold tracking-widest text-primary px-6 pt-3 pb-2 border-b border-border uppercase">
          En Espera
        </p>
        {cola.length === 0 ? (
          <p className="text-text-muted text-2xl px-6 py-3">Sin turnos en espera</p>
        ) : (
          <div className="flex gap-x-6 px-6 py-3 overflow-hidden">
            {cola.map((t) => (
              <span
                key={t.id}
                className="text-4xl font-black"
                style={{ color: t.prioridad === 'preferencial' ? '#eab308' : t.servicio.color }}
              >
                {t.prefijo}{t.numero}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
