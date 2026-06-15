import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caja } from '../entities/caja.entity';
import { User } from '../entities/user.entity';
import { TurnosModule } from '../turnos/turnos.module';
import { SimulacionService } from './simulacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Caja, User]), TurnosModule],
  providers: [SimulacionService],
  exports: [SimulacionService],
})
export class SimulacionModule {}
