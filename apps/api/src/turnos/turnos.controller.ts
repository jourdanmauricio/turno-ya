import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { TurnosService } from './turnos.service';
import { Prioridad } from '@turno-ya/types';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly service: TurnosService) {}

  @Post()
  crearTurno(@Body() body: { servicioId: number; prioridad: Prioridad }) {
    return this.service.crearTurno(body.servicioId, body.prioridad);
  }

  @Get('cola')
  obtenerCola() {
    return this.service.obtenerCola();
  }

  @Get('estadisticas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  estadisticas() {
    return this.service.obtenerEstadisticasHoy();
  }

  @Post('llamar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operador', 'admin')
  llamarSiguiente(
    @Body() body: { cajaId: number },
    @Req() req: { user: JwtPayload },
  ) {
    return this.service.llamarSiguiente(body.cajaId, req.user.sub);
  }

  @Patch(':id/atendido')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operador', 'admin')
  marcarAtendido(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarAtendido(id);
  }

  @Patch(':id/ausente')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operador', 'admin')
  marcarAusente(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarAusente(id);
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  resetTurnos() {
    return this.service.resetTurnos();
  }
}
