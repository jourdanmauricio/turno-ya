import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar' })
  prefijo: string;

  @Column({ name: 'tiempo_estimado_segundos' })
  tiempoEstimadoSegundos: number;

  @Column({ default: 'FileText' })
  icono: string;

  @Column({ default: true })
  activo: boolean;
}
