import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../entities/app-config.entity';
import { SimulacionModule } from '../simulacion/simulacion.module';
import { TurnosModule } from '../turnos/turnos.module';
import { ConfiguracionService } from './configuracion.service';
import { ConfiguracionController } from './configuracion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfig]), SimulacionModule, TurnosModule],
  providers: [ConfiguracionService],
  controllers: [ConfiguracionController],
})
export class ConfiguracionModule {}
