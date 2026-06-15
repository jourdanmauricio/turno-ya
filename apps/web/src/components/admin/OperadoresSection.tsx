'use client'

import { useState, useEffect } from 'react'
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { NuevoOperadorModal } from './NuevoOperadorModal'

interface Operador {
  id: number
  nombre: string
  email: string
  role: string
  cajaAsignada: number | null
  activo: boolean
}

interface Caja { id: number; numero: number }

const badge = (activo: boolean) =>
  `text-xs font-semibold px-2 py-0.5 rounded-full ${activo ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`

const btnToggle = (activo: boolean) =>
  activo
    ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 h-auto'
    : 'bg-[#16A34A] text-white hover:bg-[#16A34A]/90 rounded-md px-4 py-2 h-auto'

export function OperadoresSection() {
  const [operadores, setOperadores] = useState<Operador[]>([])
  const [cajas, setCajas] = useState<Caja[]>([])
  const [modal, setModal] = useState(false)

  async function fetchData() {
    const [ops, cjs] = await Promise.all([
      apiFetch<Operador[]>('/usuarios'),
      apiFetch<Caja[]>('/cajas'),
    ])
    setOperadores(ops)
    setCajas(cjs)
  }

  useEffect(() => { fetchData() }, [])

  async function toggleActivo(op: Operador) {
    await apiFetch(`/usuarios/${op.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo: !op.activo }),
    })
    fetchData()
  }

  const lista = operadores.filter((u) => u.role === 'operador')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-main">Operadores</h2>
        <Button
          onClick={() => setModal(true)}
          className="bg-primary text-white hover:bg-primary/90 rounded-md px-4 py-2 h-auto"
        >
          Nuevo Operador
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {lista.map((op) => (
          <div key={op.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-medium text-text-main truncate">{op.nombre}</p>
                <p className="text-sm text-text-muted truncate">{op.email}</p>
              </div>
              <span className={badge(op.activo)}>{op.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
            <p className="text-sm text-text-muted">Caja: {op.cajaAsignada ?? '—'}</p>
            <Button
              variant={op.activo ? 'outline' : 'default'}
              onClick={() => toggleActivo(op)}
              className={btnToggle(op.activo)}
            >
              {op.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Caja</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((op) => (
              <TableRow key={op.id}>
                <TableCell className="font-medium">{op.nombre}</TableCell>
                <TableCell className="text-text-muted">{op.email}</TableCell>
                <TableCell>{op.cajaAsignada ?? '—'}</TableCell>
                <TableCell><span className={badge(op.activo)}>{op.activo ? 'Activo' : 'Inactivo'}</span></TableCell>
                <TableCell>
                  <Button
                    variant={op.activo ? 'outline' : 'default'}
                    onClick={() => toggleActivo(op)}
                    className={btnToggle(op.activo)}
                  >
                    {op.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NuevoOperadorModal
        open={modal}
        onClose={() => setModal(false)}
        onCreado={fetchData}
        cajas={cajas}
      />
    </div>
  )
}
