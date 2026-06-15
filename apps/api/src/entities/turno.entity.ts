import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoTurno, Prioridad } from '@turno-ya/types';
import { Servicio } from './servicio.entity';
import { Caja } from './caja.entity';
import { User } from './user.entity';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: number;

  @Column({ type: 'varchar' })
  prefijo: string;

  @Column({ type: 'varchar', default: 'normal' })
  prioridad: Prioridad;

  @Column({ type: 'varchar', default: 'esperando' })
  estado: EstadoTurno;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @Column({ name: 'llamado_en', nullable: true, type: 'timestamptz' })
  llamadoEn: Date | null;

  @ManyToOne(() => Servicio, { eager: true, nullable: false })
  servicio: Servicio;

  @ManyToOne(() => Caja, { eager: true, nullable: true })
  caja: Caja | null;

  @ManyToOne(() => User, { eager: true, nullable: true })
  llamadoPor: User | null;
}
