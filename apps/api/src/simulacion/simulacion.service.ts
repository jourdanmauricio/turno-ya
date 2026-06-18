import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja } from '../entities/caja.entity';
import { User } from '../entities/user.entity';
import { TurnosService } from '../turnos/turnos.service';

@Injectable()
export class SimulacionService implements OnModuleDestroy {
  private readonly timers = new Map<number, NodeJS.Timeout>();
  private readonly activeCajas = new Set<number>();
  private adminUserId: number | null = null;

  constructor(
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly turnosService: TurnosService,
  ) {}

  async iniciar(): Promise<void> {
    this.detener();
    await this.resolveAdminId();
    const cajas = await this.cajaRepo.find({ where: { activo: true } });
    for (const c of cajas) {
      this.activeCajas.add(c.id);
      void this.simularCaja(c.id);
    }
  }

  detener(): void {
    this.activeCajas.clear();
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }

  get corriendo(): boolean {
    return this.activeCajas.size > 0;
  }

  async agregarCaja(cajaId: number): Promise<void> {
    if (!this.corriendo || this.activeCajas.has(cajaId)) return;
    await this.resolveAdminId();
    this.activeCajas.add(cajaId);
    void this.simularCaja(cajaId);
  }

  quitarCaja(cajaId: number): void {
    this.activeCajas.delete(cajaId);
    const t = this.timers.get(cajaId);
    if (t) {
      clearTimeout(t);
      this.timers.delete(cajaId);
    }
  }

  onModuleDestroy() {
    this.detener();
  }

  private async resolveAdminId(): Promise<void> {
    if (this.adminUserId !== null) return;
    const admin = await this.userRepo.findOneBy({ role: 'admin' });
    if (!admin) throw new Error('No se encontró usuario admin en la BD');
    this.adminUserId = admin.id;
  }

  private async simularCaja(cajaId: number): Promise<void> {
    if (!this.activeCajas.has(cajaId)) return;

    try {
      const turno = await this.turnosService.llamarSiguiente(cajaId, this.adminUserId!);
      const variacion = (Math.random() * 0.2 - 0.1) * turno.servicio.tiempoEstimadoSegundos;
      const delay = (turno.servicio.tiempoEstimadoSegundos + variacion) * 1_000;

      const t = setTimeout(async () => {
        this.timers.delete(cajaId);
        if (!this.activeCajas.has(cajaId)) return;
        try { await this.turnosService.marcarAtendido(turno.id); } catch {}
        void this.simularCaja(cajaId);
      }, delay);

      this.timers.set(cajaId, t);
    } catch {
      // No hay turnos disponibles — reintentar en 5 segundos
      const t = setTimeout(() => {
        this.timers.delete(cajaId);
        void this.simularCaja(cajaId);
      }, 5_000);

      this.timers.set(cajaId, t);
    }
  }
}
