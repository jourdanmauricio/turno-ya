import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../entities/app-config.entity';
import { SimulacionService } from '../simulacion/simulacion.service';
import { TurnosGateway } from '../turnos/turnos.gateway';

type ConfigDto = Partial<Pick<AppConfig, 'nombreApp' | 'horarioApertura' | 'horarioCierre' | 'simulacionActiva' | 'cartelTitulo' | 'cartelDescripcion' | 'cartelUrl' | 'baseUrl'>>;

@Injectable()
export class ConfiguracionService implements OnModuleInit {
  constructor(
    @InjectRepository(AppConfig)
    private readonly repo: Repository<AppConfig>,
    private readonly simulacionService: SimulacionService,
    private readonly gateway: TurnosGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    const config = await this.repo.findOneBy({ id: 1 });
    if (config?.simulacionActiva) {
      await this.simulacionService.iniciar();
    }
  }

  async get(): Promise<AppConfig> {
    let config = await this.repo.findOneBy({ id: 1 });
    if (!config) {
      config = this.repo.create({ id: 1 });
      await this.repo.save(config);
    }
    return config;
  }

  async update(dto: ConfigDto): Promise<AppConfig> {
    let config = await this.repo.findOneBy({ id: 1 });
    if (!config) config = this.repo.create({ id: 1 });
    Object.assign(config, dto);
    const saved = await this.repo.save(config);

    this.gateway.emitConfigActualizada();

    if (dto.simulacionActiva !== undefined) {
      if (dto.simulacionActiva) {
        await this.simulacionService.iniciar();
      } else {
        this.simulacionService.detener();
      }
    }

    return saved;
  }
}
