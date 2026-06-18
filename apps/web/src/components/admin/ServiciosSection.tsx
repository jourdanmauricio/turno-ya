'use client'

import { useState, useEffect } from 'react'
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'
import { ICONOS_DISPONIBLES, ICONO_DEFAULT, getIconoComponent, type IconoKey } from '@/lib/iconos'

interface Servicio {
  id: number
  nombre: string
  prefijo: string
  icono: string
  color: string
  tiempoEstimadoSegundos: number
  activo: boolean
}

const COLORES_DISPONIBLES = [
  { hex: '#2563EB', nombre: 'Azul' },
  { hex: '#16A34A', nombre: 'Verde' },
  { hex: '#7C3AED', nombre: 'Violeta' },
  { hex: '#EA580C', nombre: 'Naranja' },
  { hex: '#DC2626', nombre: 'Rojo' },
  { hex: '#DB2777', nombre: 'Rosa' },
  { hex: '#0D9488', nombre: 'Teal' },
  { hex: '#CA8A04', nombre: 'Amarillo' },
  { hex: '#64748B', nombre: 'Gris' },
]

const COLOR_DEFAULT = '#2563EB'

const emptyForm = { nombre: '', prefijo: '', tiempoEstimadoSegundos: '', icono: ICONO_DEFAULT as string, color: COLOR_DEFAULT }

const badge = (activo: boolean) =>
  `text-xs font-semibold px-2 py-0.5 rounded-full ${activo ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`

export function ServiciosSection() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Servicio | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    const data = await apiFetch<Servicio[]>('/servicios/admin')
    setServicios(data)
  }

  useEffect(() => { fetchData() }, [])

  function openCreate() {
    setEditTarget(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(s: Servicio) {
    setEditTarget(s)
    setForm({ nombre: s.nombre, prefijo: s.prefijo, tiempoEstimadoSegundos: String(s.tiempoEstimadoSegundos), icono: s.icono || ICONO_DEFAULT, color: s.color || COLOR_DEFAULT })
    setModalOpen(true)
  }

  async function handleSave() {
    const seg = Number(form.tiempoEstimadoSegundos)
    if (!form.nombre.trim() || !form.prefijo.trim() || isNaN(seg) || seg <= 0) return
    setSaving(true)
    try {
      if (editTarget) {
        await apiFetch(`/servicios/${editTarget.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ nombre: form.nombre, prefijo: form.prefijo.toUpperCase(), tiempoEstimadoSegundos: seg, icono: form.icono, color: form.color }),
        })
      } else {
        await apiFetch('/servicios', {
          method: 'POST',
          body: JSON.stringify({ nombre: form.nombre, prefijo: form.prefijo.toUpperCase(), tiempoEstimadoSegundos: seg, icono: form.icono, color: form.color }),
        })
      }
      setModalOpen(false)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(s: Servicio) {
    if (!confirm(`¿Eliminar el servicio "${s.nombre}"?`)) return
    await apiFetch(`/servicios/${s.id}`, { method: 'DELETE' })
    fetchData()
  }

  async function toggleActivo(s: Servicio) {
    await apiFetch(`/servicios/${s.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo: !s.activo }),
    })
    fetchData()
  }

  const field = (label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      <input
        type={opts?.type ?? 'text'}
        placeholder={opts?.placeholder}
        className="rounded border border-border px-3 py-2 text-sm outline-none focus:border-ring"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  )

  const actionButtons = (s: Servicio) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-md px-3 py-1.5 h-auto text-xs"
        onClick={() => openEdit(s)}
      >
        Editar
      </Button>
      <Button
        variant={s.activo ? 'outline' : 'default'}
        size="sm"
        className={`rounded-md px-3 py-1.5 h-auto text-xs ${!s.activo ? 'bg-[#16A34A] text-white hover:bg-[#16A34A]/90' : 'text-gray-700'}`}
        onClick={() => toggleActivo(s)}
      >
        {s.activo ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-md px-3 py-1.5 h-auto text-xs text-danger border-danger/30 hover:bg-danger/10"
        onClick={() => handleDelete(s)}
      >
        Eliminar
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-main">Servicios</h2>
        <Button onClick={openCreate} className="rounded-md px-4 py-2 h-auto text-sm">
          + Nuevo servicio
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {servicios.map((s) => {
          const Icon = getIconoComponent(s.icono)
          return (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-5 h-5 shrink-0" style={{ color: s.color }} />
                  <div>
                    <p className="font-medium text-text-main">{s.nombre}</p>
                    <span className="font-mono font-bold text-xs bg-action-light text-action px-2 py-0.5 rounded mt-1 inline-block">
                      {s.prefijo}
                    </span>
                  </div>
                </div>
                <span className={badge(s.activo)}>{s.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <p className="text-sm text-text-muted">Tiempo: {s.tiempoEstimadoSegundos} seg</p>
              {actionButtons(s)}
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icono</TableHead>
              <TableHead>Prefijo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tiempo estimado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicios.map((s) => {
              const Icon = getIconoComponent(s.icono)
              return (
                <TableRow key={s.id}>
                  <TableCell><Icon className="w-5 h-5" style={{ color: s.color }} /></TableCell>
                  <TableCell className="font-mono font-bold">{s.prefijo}</TableCell>
                  <TableCell className="font-medium">{s.nombre}</TableCell>
                  <TableCell>{s.tiempoEstimadoSegundos} seg</TableCell>
                  <TableCell><span className={badge(s.activo)}>{s.activo ? 'Activo' : 'Inactivo'}</span></TableCell>
                  <TableCell>{actionButtons(s)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            {field('Nombre', 'nombre', { placeholder: 'Ej: Pagar Servicios' })}
            {field('Prefijo', 'prefijo', { placeholder: 'Ej: A' })}
            {field('Tiempo estimado (seg)', 'tiempoEstimadoSegundos', { type: 'number', placeholder: 'Ej: 300' })}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORES_DISPONIBLES.map(({ hex, nombre }) => (
                  <button
                    key={hex}
                    type="button"
                    title={nombre}
                    onClick={() => setForm((f) => ({ ...f, color: hex }))}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === hex ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">Icono</label>
              <div className="grid grid-cols-6 gap-1.5">
                {(Object.keys(ICONOS_DISPONIBLES) as IconoKey[]).map((key) => {
                  const Icon = ICONOS_DISPONIBLES[key]
                  const selected = form.icono === key
                  return (
                    <button
                      key={key}
                      type="button"
                      title={key}
                      onClick={() => setForm((f) => ({ ...f, icono: key }))}
                      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors ${selected ? 'border-primary bg-action-light' : 'border-border hover:border-primary/50 hover:bg-action-light/50'}`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? 'text-primary' : 'text-text-muted'}`} />
                      <span className="text-[9px] text-text-muted leading-none truncate w-full text-center">{key}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editTarget ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
