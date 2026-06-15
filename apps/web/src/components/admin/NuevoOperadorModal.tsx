'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

interface Caja { id: number; numero: number }

interface Props {
  open: boolean
  onClose: () => void
  onCreado: () => void
  cajas: Caja[]
}

export function NuevoOperadorModal({ open, onClose, onCreado, cajas }: Props) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cajaId, setCajaId] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setNombre(''); setEmail(''); setPassword(''); setCajaId('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nombre,
          email,
          password,
          cajaAsignada: cajaId ? Number(cajaId) : null,
        }),
      })
      reset()
      onCreado()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Operador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="op-nombre">Nombre</Label>
            <Input id="op-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="op-email">Email</Label>
            <Input id="op-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="op-password">Contraseña</Label>
            <Input id="op-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="op-caja">Caja asignada</Label>
            <select
              id="op-caja"
              value={cajaId}
              onChange={(e) => setCajaId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Sin asignar</option>
              {cajas.map((c) => (
                <option key={c.id} value={c.id}>Caja {c.numero}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90 rounded-md px-4 py-2 h-auto"
            >
              {loading ? 'Guardando...' : 'Crear operador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
