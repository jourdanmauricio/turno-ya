'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/admin/Sidebar'
import { OperadoresSection } from '@/components/admin/OperadoresSection'
import { ServiciosSection } from '@/components/admin/ServiciosSection'
import { CajasSection } from '@/components/admin/CajasSection'
import { EstadisticasSection } from '@/components/admin/EstadisticasSection'
import { ConfiguracionSection } from '@/components/admin/ConfiguracionSection'
import { CartelQrSection } from '@/components/admin/CartelQrSection'
import { UrlsSection } from '@/components/admin/UrlsSection'
import { useAppConfig } from '@/context/AppConfigContext'

type Seccion = 'operadores' | 'servicios' | 'cajas' | 'estadisticas' | 'configuracion' | 'cartel-qr' | 'urls'

export default function AdminPage() {
  const { user, access_token, logout } = useAuth()
  const { nombreApp } = useAppConfig()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [seccion, setSeccion] = useState<Seccion>('operadores')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!access_token || user?.role !== 'admin') {
      router.replace('/login')
    }
  }, [mounted, access_token, user])

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  function handleSeccion(s: Seccion) {
    setSeccion(s)
    setDrawerOpen(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Top bar — mobile only */}
      <header className="flex md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-primary items-center justify-between px-4">
        <button onClick={() => setDrawerOpen(true)} className="text-white p-1 -ml-1">
          <Menu size={22} />
        </button>
        <span className="text-white font-bold text-lg">{nombreApp}</span>
        <span className="text-white/80 text-sm truncate max-w-28">{user?.nombre}</span>
      </header>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar: drawer on mobile, static on md+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200
          md:static md:z-auto md:translate-x-0
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar
          seccion={seccion}
          onSeccion={handleSeccion}
          nombre={user?.nombre ?? ''}
          onLogout={handleLogout}
        />
      </div>

      <main className="flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-8">
        {seccion === 'operadores' && <OperadoresSection />}
        {seccion === 'servicios' && <ServiciosSection />}
        {seccion === 'cajas' && <CajasSection />}
        {seccion === 'estadisticas' && <EstadisticasSection />}
        {seccion === 'configuracion' && <ConfiguracionSection />}
        {seccion === 'cartel-qr' && <CartelQrSection />}
        {seccion === 'urls' && <UrlsSection />}
      </main>
    </div>
  )
}
