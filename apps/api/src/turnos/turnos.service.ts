import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoTurno, Prioridad, PrefijoServicio } from '@turno-ya/types';
import { Turno } from '../entities/turno.entity';
import { Servicio } from '../entities/servicio.entity';
import { Caja } from '../entities/caja.entity';
import { User } from '../entities/user.entity';
import { TurnosGateway } from './turnos.gateway';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepo: Repository<Turno>,
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
    private readonly gateway: TurnosGateway,
  ) {}

  async crearTurno(servicioId: number, prioridad: Prioridad): Promise<Turno> {
    const servicio = await this.servicioRepo.findOneBy({ id: servicioId, activo: true });
    if (!servicio) throw new NotFoundException('Servicio no encontrado o inactivo');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const ultimo = await this.turnoRepo
      .createQueryBuilder('t')
      .where('t.prefijo = :prefijo', { prefijo: servicio.prefijo })
      .andWhere('t.creadoEn >= :hoy', { hoy })
      .andWhere('t.creadoEn < :manana', { manana })
      .orderBy('t.numero', 'DESC')
      .getOne();

    const numero = (ultimo?.numero ?? 0) + 1;

    const turno = this.turnoRepo.create({
      numero,
      prefijo: servicio.prefijo,
      prioridad,
      estado: 'esperando',
      servicio,
      caja: null,
      llamadoPor: null,
      llamadoEn: null,
    });

    const saved = await this.turnoRepo.save(turno);
    this.gateway.emitTurnoActualizado(saved.id);
    return saved;
  }

  async obtenerCola(): Promise<Turno[]> {
    const turnos = await this.turnoRepo.find({
      where: { estado: 'esperando' },
      order: { creadoEn: 'ASC' },
    });

    return turnos.sort((a, b) => {
      if (a.prioridad === 'preferencial' && b.prioridad !== 'preferencial') return -1;
      if (a.prioridad !== 'preferencial' && b.prioridad === 'preferencial') return 1;
      return 0;
    });
  }

  async llamarSiguiente(cajaId: number, operadorId: number): Promise<Turno> {
    const cola = await this.obtenerCola();
    if (cola.length === 0) throw new NotFoundException('No hay turnos en espera');

    const turno = cola[0];
    turno.estado = 'llamado';
    turno.llamadoEn = new Date();
    turno.caja = { id: cajaId } as Caja;
    turno.llamadoPor = { id: operadorId } as User;

    await this.turnoRepo.save(turno);

    const actualizado = await this.turnoRepo.findOneBy({ id: turno.id });
    if (!actualizado) throw new NotFoundException('Error al recargar turno');

    this.gateway.emitTurnoLlamado({
      turnoId: actualizado.id,
      numero: actualizado.numero,
      prefijo: actualizado.prefijo as PrefijoServicio,
      cajaNumero: actualizado.caja!.numero,
      servicio: actualizado.servicio.nombre,
    });

    return actualizado;
  }

  async marcarAtendido(turnoId: number): Promise<Turno> {
    return this.cambiarEstado(turnoId, 'atendido');
  }

  async marcarAusente(turnoId: number): Promise<Turno> {
    return this.cambiarEstado(turnoId, 'ausente');
  }

  private async cambiarEstado(turnoId: number, estado: EstadoTurno): Promise<Turno> {
    const turno = await this.turnoRepo.findOneBy({ id: turnoId });
    if (!turno) throw new NotFoundException('Turno no encontrado');
    if (turno.estado === 'atendido' || turno.estado === 'ausente') {
      throw new BadRequestException('El turno ya está finalizado');
    }
    turno.estado = estado;
    const saved = await this.turnoRepo.save(turno);
    this.gateway.emitTurnoActualizado(saved.id);
    return saved;
  }

  async resetTurnos(): Promise<{ eliminados: number }> {
    const result = await this.turnoRepo
      .createQueryBuilder()
      .delete()
      .where('estado IN (:...estados)', { estados: ['esperando', 'llamado'] })
      .execute();
    return { eliminados: result.affected ?? 0 };
  }

  async obtenerEstadisticasHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const turnos = await this.turnoRepo
      .createQueryBuilder('t')
      .where('t.creadoEn >= :hoy AND t.creadoEn < :manana', { hoy, manana })
      .getMany();

    const conteo = { esperando: 0, llamado: 0, atendido: 0, ausente: 0 };
    for (const t of turnos) conteo[t.estado]++;

    const atendidos = turnos.filter((t) => t.estado === 'atendido' && t.llamadoEn);
    const tiempoPromedioMinutos =
      atendidos.length > 0
        ? atendidos.reduce(
            (sum, t) => sum + (t.llamadoEn!.getTime() - t.creadoEn.getTime()),
            0,
          ) /
          atendidos.length /
          60_000
        : null;

    return {
      total: turnos.length,
      ...conteo,
      tiempoPromedioMinutos:
        tiempoPromedioMinutos !== null
          ? Math.round(tiempoPromedioMinutos * 10) / 10
          : null,
    };
  }
}
