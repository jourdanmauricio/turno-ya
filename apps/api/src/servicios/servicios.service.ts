import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from '../entities/servicio.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly repo: Repository<Servicio>,
  ) {}

  findActivos(): Promise<Servicio[]> {
    return this.repo.find({ where: { activo: true }, order: { prefijo: 'ASC' } });
  }

  findAll(): Promise<Servicio[]> {
    return this.repo.find({ order: { prefijo: 'ASC' } });
  }

  async create(dto: { nombre: string; prefijo: string; tiempoEstimadoSegundos: number; icono?: string; color?: string }): Promise<Servicio> {
    const servicio = this.repo.create({ ...dto, activo: true });
    return this.repo.save(servicio);
  }

  async update(
    id: number,
    dto: { nombre?: string; prefijo?: string; tiempoEstimadoSegundos?: number; icono?: string; color?: string; activo?: boolean },
  ): Promise<Servicio> {
    const servicio = await this.repo.findOneBy({ id });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    Object.assign(servicio, dto);
    return this.repo.save(servicio);
  }

  async remove(id: number): Promise<void> {
    const servicio = await this.repo.findOneBy({ id });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    await this.repo.remove(servicio);
  }
}
