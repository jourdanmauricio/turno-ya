import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cajas')
export class Caja {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: number;

  @Column({ default: true })
  activo: boolean;
}
