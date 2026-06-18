export interface Servicio {
  id: number
  nombre: string
  prefijo: string
  icono: string
  tiempoEstimadoSegundos: number
  activo: boolean
}

export interface Turno {
  id: number
  numero: number
  prefijo: string
  prioridad: 'normal' | 'preferencial'
  servicio: Servicio
}
