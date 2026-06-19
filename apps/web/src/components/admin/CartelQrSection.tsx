'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Save } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAppConfig } from '@/context/AppConfigContext'

type ToastState = { msg: string; type: 'ok' | 'err' } | null

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

interface Config {
  cartelTitulo: string
  cartelDescripcion: string
  cartelUrl: string
}

export function CartelQrSection() {
  const [titulo, setTitulo] = useState('Sacá tu turno')
  const [descripcion, setDescripcion] = useState(
    'Escaneá el código QR con tu celular y reservá tu lugar en la fila sin esperar en la puerta.'
  )
  const [url, setUrl] = useState('')
  const { nombreApp } = useAppConfig()
  const [generando, setGenerando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  useEffect(() => {
    apiFetch<Config>('/configuracion')
      .then((cfg) => {
        setTitulo(cfg.cartelTitulo || 'Sacá tu turno')
        setDescripcion(cfg.cartelDescripcion || 'Escaneá el código QR con tu celular y reservá tu lugar en la fila sin esperar en la puerta.')
        setUrl(cfg.cartelUrl || (typeof window !== 'undefined' ? `${window.location.origin}/mobile` : ''))
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          setUrl(`${window.location.origin}/mobile`)
        }
      })
  }, [])

  async function guardar() {
    setGuardando(true)
    try {
      await apiFetch('/configuracion', {
        method: 'PATCH',
        body: JSON.stringify({ cartelTitulo: titulo, cartelDescripcion: descripcion, cartelUrl: url }),
      })
      showToast('Cartel guardado', 'ok')
    } catch {
      showToast('Error al guardar', 'err')
    } finally {
      setGuardando(false)
    }
  }

  async function descargarPDF() {
    if (!previewRef.current) return
    setGenerando(true)
    try {
      const { jsPDF } = await import('jspdf')

      const S = 2
      const W = 794 * S
      const H = 1123 * S
      const pad = 56 * S
      const contentW = W - pad * 2

      const poster = document.createElement('canvas')
      poster.width = W
      poster.height = H
      const ctx = poster.getContext('2d')!

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)

      let curY = pad

      // Header bar
      const headerH = 72 * S
      ctx.fillStyle = '#3B57F7'
      ctx.beginPath()
      ctx.roundRect(pad, curY, contentW, headerH, 12 * S)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${28 * S}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(nombreApp, W / 2, curY + headerH / 2)
      curY += headerH + 48 * S

      // Title
      const titleLineH = 44 * S
      ctx.fillStyle = '#111827'
      ctx.font = `bold ${34 * S}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const titleLines = wrapCanvasText(ctx, titulo || 'Título del cartel', contentW)
      titleLines.forEach((line, i) => ctx.fillText(line, W / 2, curY + i * titleLineH))
      curY += titleLines.length * titleLineH + 48 * S

      // QR code
      const qrEl = previewRef.current.querySelector('canvas')
      if (qrEl) {
        const qrSize = 240 * S
        const qrPad = 14 * S
        const boxSize = qrSize + qrPad * 2
        const boxX = (W - boxSize) / 2
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#111827'
        ctx.lineWidth = 6 * S
        ctx.beginPath()
        ctx.roundRect(boxX, curY, boxSize, boxSize, 18 * S)
        ctx.fill()
        ctx.stroke()
        ctx.drawImage(qrEl, boxX + qrPad, curY + qrPad, qrSize, qrSize)
        curY += boxSize + 48 * S
      }

      // Description
      const descLineH = 26 * S
      ctx.fillStyle = '#4B5563'
      ctx.font = `${18 * S}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const descLines = wrapCanvasText(ctx, descripcion, contentW)
      descLines.forEach((line, i) => ctx.fillText(line, W / 2, curY + i * descLineH))
      curY += descLines.length * descLineH + 24 * S

      // URL
      ctx.fillStyle = '#9CA3AF'
      ctx.font = `${12 * S}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(url, W / 2, curY)

      const imgData = poster.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
      pdf.save('cartel-qr.pdf')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-text-main">Cartel QR</h2>
      <p className="text-sm text-text-muted">
        Generá un cartel imprimible para que los clientes puedan sacar su turno escaneando el código QR con el celular.
      </p>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-xs ${
            toast.type === 'ok' ? 'bg-[#16A34A]' : 'bg-danger'
          }`}
        >
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white shrink-0">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-text-main">Personalizar cartel</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-action"
                placeholder="Ej: Sacá tu turno"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-action resize-none"
                placeholder="Texto explicativo para el cliente"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">URL del QR</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-action font-mono"
                placeholder="https://..."
              />
              <p className="text-xs text-text-muted">
                Por defecto apunta a la pantalla de turnos de tu local.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={guardar}
              disabled={guardando}
              variant="outline"
              className="flex-1 gap-2"
            >
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button
              onClick={descargarPDF}
              disabled={generando || !url}
              className="flex-1 gap-2"
            >
              {generando ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {generando ? 'Generando PDF…' : 'Descargar PDF'}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Vista previa</p>
          <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-gray-50 p-4 flex items-center justify-center">
            <div
              ref={previewRef}
              className="bg-white w-full max-w-85 aspect-210/297 flex flex-col items-center justify-center gap-6 px-10 py-10 rounded-lg"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              <div
                className="w-full py-4 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#3B57F7' }}
              >
                <span className="font-bold text-white tracking-tight" style={{ fontSize: 22 }}>
                  {nombreApp}
                </span>
              </div>

              <h1 className="font-bold text-center text-gray-900 leading-tight" style={{ fontSize: 26 }}>
                {titulo || 'Título del cartel'}
              </h1>

              <div className="border-4 border-gray-900 rounded-2xl p-3 bg-white">
                {url ? (
                  <QRCodeCanvas value={url} size={160} level="M" />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    Ingresá una URL
                  </div>
                )}
              </div>

              <p className="text-center text-gray-600 leading-snug" style={{ fontSize: 13 }}>
                {descripcion}
              </p>

              <p className="text-center text-gray-400 break-all" style={{ fontSize: 10 }}>
                {url}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
