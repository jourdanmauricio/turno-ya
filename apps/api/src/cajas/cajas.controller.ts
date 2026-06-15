import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CajasService } from './cajas.service';

@Controller('cajas')
export class CajasController {
  constructor(private readonly service: CajasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create() {
    return this.service.create();
  }

  @Get()
  findActivas() {
    return this.service.findActivas();
  }

  @Get('estado')
  getCajasEstado() {
    return this.service.getCajasEstado();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { activo?: boolean },
  ) {
    return this.service.update(id, body);
  }
}
