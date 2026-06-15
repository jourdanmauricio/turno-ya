'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { type TurnoLlamadoPayload, WS_EVENTS } from '@turno-ya/types'
import { getSocket } from '@/lib/socket'
import BienvenidaPanel from '@/components/display/BienvenidaPanel'
import TurnosPanel, { type CajaEstado, type ColaItem } from '@/components/display/TurnosPanel'
import { useDisplaySound } from '@/hooks/useDisplaySound'

interface AppConfig {
  nombreApp: string
  horarioApertura: string
  horarioCierre: string
}

const DEFAULT_CONFIG: AppConfig = {
  nombreApp: 'TurnoYa',
  horarioApertura: '08:00',
  horarioCierre: '18:00',
}

export default function DisplayPage() {
  const [cajasEstado, setCajasEstado] = useState<CajaEstado[]>([])
  const [cola, setCola] = useState<ColaItem[]>([])
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [hora, setHora] = useState('')
  const [ultimoLlamado, setUltimoLlamado] = useState<TurnoLlamadoPayload | null>(null)
  const [pulsatingCajaNumero, setPulsatingCajaNumero] = useState<number | null>(null)
  const [bouncingCajaNumero, setBouncingCajaNumero] = useState<number | null>(null)
  const [audioListo, setAudioListo] = useState(false)
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playBeep = useDisplaySound()

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion`)
      if (res.ok) setConfig(await res.json())
    } catch {}
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [cajasRes, colaRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cajas/estado`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/turnos/cola`),
      ])
      if (cajasRes.ok) setCajasEstado(await cajasRes.json())
      if (colaRes.ok) setCola(await colaRes.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    fetchData()
    const poll = setInterval(fetchData, 15_000)
    return () => clearInterval(poll)
  }, [fetchData])

  useEffect(() => {
    const socket = getSocket()
    socket.on(WS_EVENTS.TURNO_ACTUALIZADO, () => fetchData())
    socket.on(WS_EVENTS.CAJA_ACTUALIZADA, () => fetchData())
    socket.on(WS_EVENTS.CONFIG_ACTUALIZADA, () => fetchConfig())
    socket.on(WS_EVENTS.TURNO_LLAMADO, (payload: TurnoLlamadoPayload) => {
      setUltimoLlamado(payload)
      fetchData()
      void playBeep()

      if (pulseTimer.current) clearTimeout(pulseTimer.current)
      if (bounceTimer.current) clearTimeout(bounceTimer.current)
      setPulsatingCajaNumero(payload.cajaNumero)
      setBouncingCajaNumero(payload.cajaNumero)
      bounceTimer.current = setTimeout(() => setBouncingCajaNumero(null), 1000)
      pulseTimer.current = setTimeout(() => setPulsatingCajaNumero(null), 10000)
    })
    return () => {
      socket.off(WS_EVENTS.TURNO_ACTUALIZADO)
      socket.off(WS_EVENTS.CAJA_ACTUALIZADA)
      socket.off(WS_EVENTS.CONFIG_ACTUALIZADA)
      socket.off(WS_EVENTS.TURNO_LLAMADO)
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
      if (bounceTimer.current) clearTimeout(bounceTimer.current)
    }
  }, [fetchData, fetchConfig, playBeep])

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    setHora(fmt())
    const t = setInterval(() => setHora(fmt()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-screen overflow-hidden flex flex-col select-none relative">

      {!audioListo && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 cursor-pointer"
          onClick={() => setAudioListo(true)}
        >
          <div className="bg-white rounded-3xl px-12 py-10 text-center shadow-2xl flex flex-col items-center gap-3">
            <span className="text-5xl">🔊</span>
            <p className="text-2xl font-bold text-gray-800">Tocá para activar el sonido</p>
            <p className="text-base text-gray-500">El display quedará listo para funcionar</p>
          </div>
        </div>
      )}

      <header className="bg-primary h-14 flex items-center justify-between px-6 shrink-0">
        <span className="text-white font-bold text-xl">{config.nombreApp}</span>
        <span className="text-white/70 text-base tabular-nums">{hora}</span>
      </header>

      <div className="flex flex-row flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-border overflow-hidden">
          <BienvenidaPanel
            nombreApp={config.nombreApp}
            horarioApertura={config.horarioApertura}
            horarioCierre={config.horarioCierre}
          />
        </div>
        <div className="w-2/3 overflow-hidden">
          <TurnosPanel
            cajasEstado={cajasEstado}
            cola={cola}
            pulsatingCajaNumero={pulsatingCajaNumero}
            bouncingCajaNumero={bouncingCajaNumero}
          />
        </div>
      </div>
    </div>
  )
}
