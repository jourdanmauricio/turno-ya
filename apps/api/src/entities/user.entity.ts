import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '@turno-ya/types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', default: 'operador' })
  role: UserRole;

  @Column({ name: 'caja_asignada', nullable: true, type: 'int' })
  cajaAsignada: number | null;

  @Column({ default: true })
  activo: boolean;
}
