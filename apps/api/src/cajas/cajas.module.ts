import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caja } from '../entities/caja.entity';
import { Turno } from '../entities/turno.entity';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';
import { TurnosModule } from '../turnos/turnos.module';
import { SimulacionModule } from '../simulacion/simulacion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Caja, Turno]), TurnosModule, SimulacionModule],
  providers: [CajasService],
  controllers: [CajasController],
})
export class CajasModule {}
