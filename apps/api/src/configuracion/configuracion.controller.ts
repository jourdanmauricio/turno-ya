import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfiguracionService } from './configuracion.service';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly service: ConfiguracionService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Body()
    body: {
      nombreApp?: string;
      horarioApertura?: string;
      horarioCierre?: string;
      simulacionActiva?: boolean;
      cartelTitulo?: string;
      cartelDescripcion?: string;
      cartelUrl?: string;
      baseUrl?: string;
    },
  ) {
    return this.service.update(body);
  }
}
