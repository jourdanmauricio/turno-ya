import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('app_config')
export class AppConfig {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ default: 'TurnoYa' })
  nombreApp: string;

  @Column({ name: 'horario_apertura', default: '08:00' })
  horarioApertura: string;

  @Column({ name: 'horario_cierre', default: '18:00' })
  horarioCierre: string;

  @Column({ name: 'cantidad_cajas', default: 1 })
  cantidadCajas: number;

  @Column({ name: 'simulacion_activa', default: false })
  simulacionActiva: boolean;

  @Column({ name: 'cartel_titulo', default: 'Sacá tu turno' })
  cartelTitulo: string;

  @Column({ name: 'cartel_descripcion', default: 'Escaneá el código QR con tu celular y reservá tu lugar en la fila sin esperar en la puerta.' })
  cartelDescripcion: string;

  @Column({ name: 'cartel_url', default: '' })
  cartelUrl: string;

  @Column({ name: 'base_url', default: '' })
  baseUrl: string;
}
