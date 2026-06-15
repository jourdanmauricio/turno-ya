'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { WS_EVENTS } from '@turno-ya/types'
import { useAppConfig } from '@/context/AppConfigContext'
import { TurnoActualCard } from '@/components/operador/TurnoActualCard'
import { ColaPreview } from '@/components/operador/ColaPreview'
import type { TurnoItem } from '@/components/operador/TurnoActualCard'

export default function OperadorPage() {
  const { user, access_token, logout } = useAuth()
  const { nombreApp } = useAppConfig()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [turnoActual, setTurnoActual] = useState<TurnoItem | null>(null)
  const [cola, setCola] = useState<TurnoItem[]>([])

  async function fetchCola() {
    const data = await apiFetch<TurnoItem[]>('/turnos/cola')
    setCola(data)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!access_token) {
      router.replace('/login')
      return
    }
    fetchCola()
    const interval = setInterval(fetchCola, 15000)
    const socket = getSocket()
    socket.on(WS_EVENTS.TURNO_LLAMADO, fetchCola)
    return () => {
      clearInterval(interval)
      socket.off(WS_EVENTS.TURNO_LLAMADO, fetchCola)
    }
  }, [mounted, access_token])

  async function handleLlamarSiguiente() {
    if (!user?.cajaAsignada) return
    const turno = await apiFetch<TurnoItem>('/turnos/llamar', {
      method: 'POST',
      body: JSON.stringify({ cajaId: user.cajaAsignada }),
    })
    setTurnoActual(turno)
    await fetchCola()
  }

  function handleAction() {
    setTurnoActual(null)
    fetchCola()
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="bg-primary h-14 flex items-center justify-between px-6">
        <span className="text-white font-bold text-xl">{nombreApp}</span>
        <span className="text-white font-bold text-lg">CAJA {user?.cajaAsignada}</span>
        <div className="flex items-center gap-3">
          <span className="text-white">{user?.nombre}</span>
          <button
            className="text-white/70 text-sm hover:text-white transition-colors"
            onClick={() => { logout(); router.replace('/login') }}
          >
            Salir
          </button>
        </div>
      </header>
      <main className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
        <TurnoActualCard turno={turnoActual} onAction={handleAction} />
        <button
          className="w-full py-5 text-xl font-bold bg-action text-white rounded-xl hover:bg-action/90 transition-colors"
          onClick={handleLlamarSiguiente}
        >
          LLAMAR SIGUIENTE
        </button>
        <ColaPreview cola={cola} />
      </main>
    </div>
  )
}
