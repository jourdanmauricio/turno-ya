'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { WS_EVENTS } from '@turno-ya/types'
import { getSocket } from '@/lib/socket'

interface AppConfigValue {
  nombreApp: string
}

const AppConfigContext = createContext<AppConfigValue>({ nombreApp: 'TurnoYa' })

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [nombreApp, setNombreApp] = useState('TurnoYa')

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion`)
      if (res.ok) {
        const data = await res.json()
        const name = data.nombreApp || 'TurnoYa'
        setNombreApp(name)
        document.title = name
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchConfig()
    const socket = getSocket()
    socket.on(WS_EVENTS.CONFIG_ACTUALIZADA, fetchConfig)
    return () => { socket.off(WS_EVENTS.CONFIG_ACTUALIZADA, fetchConfig) }
  }, [fetchConfig])

  return (
    <AppConfigContext.Provider value={{ nombreApp }}>
      {children}
    </AppConfigContext.Provider>
  )
}

export function useAppConfig() {
  return useContext(AppConfigContext)
}
