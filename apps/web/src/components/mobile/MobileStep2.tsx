'use client'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPrefixColor } from '@/lib/prefix'
import { getSocket } from '@/lib/socket'
import { WS_EVENTS, type TurnoLlamadoPayload } from '@turno-ya/types'
import type { Turno } from '@/app/totem/types'

interface Props {
  turno: Turno
  colaCount: number
  onNuevo: () => void
}

export default function MobileStep2({ turno, colaCount, onNuevo }: Props) {
  const [banner, setBanner] = useState<string | null>(null)
  const color = getPrefixColor(turno.prefijo)
  const numeroFormato = `${turno.prefijo}-${turno.numero.toString().padStart(2, '0')}`
  const tiempoTotal = colaCount * Math.round(turno.servicio.tiempoEstimadoSegundos / 60)

  useEffect(() => {
    const canNotify = typeof window !== 'undefined' && 'Notification' in window

    if (canNotify && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const socket = getSocket()

    function handleLlamado(payload: TurnoLlamadoPayload) {
      if (payload.turnoId !== turno.id) return
      const body = `Dirigite a la caja ${payload.cajaNumero}`
      if (canNotify && Notification.permission === 'granted') {
        new Notification('¡Es tu turno!', { body })
      } else {
        setBanner(`¡Es tu turno! ${body}`)
      }
    }

    socket.on(WS_EVENTS.TURNO_LLAMADO, handleLlamado)
    return () => { socket.off(WS_EVENTS.TURNO_LLAMADO, handleLlamado) }
  }, [turno.id])

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5 animate-flash-in">
      {banner && (
        <div className="w-full max-w-sm bg-success text-white rounded-xl px-4 py-3 font-semibold text-sm">
          {banner}
        </div>
      )}

      <p className="text-xs text-text-muted tracking-widest uppercase">Tu turno es</p>

      <div className="text-8xl font-black leading-none" style={{ color }}>
        {numeroFormato}
      </div>

      <div className="flex flex-col items-center gap-1 text-text-muted text-sm">
        <span>
          Faltan <span className="font-semibold text-text-main">{colaCount}</span> personas
        </span>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            Aprox. <span className="font-semibold text-text-main">{tiempoTotal} min</span>
          </span>
        </div>
      </div>

      <p className="text-text-muted text-sm max-w-xs">
        Te avisaremos cuando sea tu turno
      </p>

      <Button variant="outline" size="lg" className="mt-2" onClick={onNuevo}>
        Sacar otro turno
      </Button>
    </main>
  )
}
