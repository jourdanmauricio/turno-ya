import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja } from '../entities/caja.entity';
import { Turno } from '../entities/turno.entity';
import { TurnosGateway } from '../turnos/turnos.gateway';
import { SimulacionService } from '../simulacion/simulacion.service';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly repo: Repository<Caja>,
    @InjectRepository(Turno)
    private readonly turnoRepo: Repository<Turno>,
    private readonly gateway: TurnosGateway,
    private readonly simulacion: SimulacionService,
  ) {}

  async getCajasEstado() {
    const cajas = await this.repo.find({ where: { activo: true }, order: { numero: 'ASC' } });

    return Promise.all(
      cajas.map(async (caja) => {
        const turno = await this.turnoRepo.findOne({
          where: { caja: { id: caja.id }, estado: 'llamado' },
          order: { llamadoEn: 'DESC' },
        });

        return {
          cajaId: caja.id,
          cajaNumero: caja.numero,
          turnoActual: turno
            ? {
                id: turno.id,
                numero: turno.numero,
                prefijo: turno.prefijo,
                servicio: turno.servicio.nombre,
              }
            : null,
        };
      }),
    );
  }

  findActivas(): Promise<Caja[]> {
    return this.repo.find({ where: { activo: true }, order: { numero: 'ASC' } });
  }

  findAll(): Promise<Caja[]> {
    return this.repo.find({ order: { numero: 'ASC' } });
  }

  async create(): Promise<Caja> {
    const all = await this.repo.find({ order: { numero: 'ASC' } });
    const numeros = new Set(all.map((c) => c.numero));
    let next = 1;
    while (numeros.has(next)) next++;
    const caja = this.repo.create({ numero: next, activo: true });
    const saved = await this.repo.save(caja);
    this.gateway.emitCajaActualizada();
    void this.simulacion.agregarCaja(saved.id);
    return saved;
  }

  async update(id: number, dto: { activo?: boolean }): Promise<Caja> {
    const caja = await this.repo.findOneBy({ id });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    Object.assign(caja, dto);
    const saved = await this.repo.save(caja);
    this.gateway.emitCajaActualizada();
    if (dto.activo === true) {
      void this.simulacion.agregarCaja(saved.id);
    } else if (dto.activo === false) {
      this.simulacion.quitarCaja(saved.id);
    }
    return saved;
  }
}
