export type UserRole = 'admin' | 'operador';
export type Prioridad = 'normal' | 'preferencial';
export type EstadoTurno = 'esperando' | 'llamado' | 'atendido' | 'ausente';
export type PrefijoServicio = 'A' | 'B' | 'C';
export declare const WS_EVENTS: {
    readonly TURNO_LLAMADO: "turno:llamado";
    readonly TURNO_ACTUALIZADO: "turno:actualizado";
};
export interface TurnoLlamadoPayload {
    turnoId: number;
    numero: number;
    prefijo: PrefijoServicio;
    cajaNumero: number;
    servicio: string;
}
