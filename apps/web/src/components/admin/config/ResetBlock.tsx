'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'

interface Props {
  showToast: (msg: string, type: 'ok' | 'err') => void
}

export function ResetBlock({ showToast }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function confirmar() {
    setLoading(true)
    try {
      const res = await apiFetch<{ eliminados: number }>('/turnos/reset', {
        method: 'POST',
      })
      setOpen(false)
      showToast(`Se eliminaron ${res.eliminados} turnos pendientes`, 'ok')
    } catch {
      showToast('Error al resetear los turnos', 'err')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
      <h3 className="font-semibold text-text-main">Reset de jornada</h3>
      <p className="text-sm text-text-muted">
        Elimina todos los turnos pendientes y en espera. Los turnos atendidos se conservan.
      </p>
      <Button
        onClick={() => setOpen(true)}
        className="self-start bg-[#DC2626] text-white hover:bg-[#DC2626]/90 rounded-md px-4 py-2 h-auto"
      >
        Resetear turnos
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>¿Resetear jornada?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={confirmar}
              disabled={loading}
              className="bg-[#DC2626] text-white hover:bg-[#DC2626]/90"
            >
              {loading ? 'Reseteando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
