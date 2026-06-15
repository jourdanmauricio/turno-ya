import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from '../entities/turno.entity';
import { Servicio } from '../entities/servicio.entity';
import { Caja } from '../entities/caja.entity';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { TurnosGateway } from './turnos.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, Servicio, Caja])],
  providers: [TurnosService, TurnosGateway],
  controllers: [TurnosController],
  exports: [TurnosService, TurnosGateway],
})
export class TurnosModule {}
