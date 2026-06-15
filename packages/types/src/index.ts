// Roles
export type UserRole = 'admin' | 'operador';

// Prioridad de turno
export type Prioridad = 'normal' | 'preferencial';

// Estado del turno
export type EstadoTurno = 'esperando' | 'llamado' | 'atendido' | 'ausente';

// Prefijos por servicio
export type PrefijoServicio = 'A' | 'B' | 'C';

// Eventos WebSocket
export const WS_EVENTS = {
  TURNO_LLAMADO: 'turno:llamado',
  TURNO_ACTUALIZADO: 'turno:actualizado',
  CAJA_ACTUALIZADA: 'caja:actualizada',
  CONFIG_ACTUALIZADA: 'config:actualizada',
} as const;

// Payload del evento turno llamado
export interface TurnoLlamadoPayload {
  turnoId: number;
  numero: number;
  prefijo: PrefijoServicio;
  cajaNumero: number;
  servicio: string;
}
