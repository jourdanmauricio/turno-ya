import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TurnoInfo {
  numero: number
  prefijo: string
  prioridad: 'normal' | 'preferencial'
  servicio: {
    nombre: string
    tiempoEstimadoSegundos: number
  }
}

interface Props {
  turno: TurnoInfo
  colaCount: number
  onNuevo: () => void
}

export function TurnoConfirmado({ turno, colaCount, onNuevo }: Props) {
  const numeroFormato = `${turno.prefijo}-${turno.numero.toString().padStart(2, '0')}`
  const tiempoTotal = Math.round(colaCount * turno.servicio.tiempoEstimadoSegundos / 60)
  const colorClass = `text-prefix-${turno.prefijo.toLowerCase()}`

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center animate-flash-in px-8 gap-6">
      <p className="text-3xl text-text-muted tracking-widest uppercase">Tu turno es</p>
      <div className={`text-[12rem] font-black leading-none ${colorClass}`}>
        {numeroFormato}
      </div>
      <div className="text-3xl text-text-main font-medium">{turno.servicio.nombre}</div>
      <p className="text-xl text-text-muted">
        Faltan <span className="font-semibold text-text-main">{colaCount}</span> personas
        {' · '}Aprox. <span className="font-semibold text-text-main">{tiempoTotal} min</span>
      </p>
      <div className="flex items-center gap-2 text-text-muted text-lg mt-2">
        <Printer className="w-6 h-6" />
        Retirá tu ticket
      </div>
      <Button variant="outline" className="mt-4 h-auto text-lg px-8 py-4" onClick={onNuevo}>
        Nuevo turno
      </Button>
    </main>
  )
}
