import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

type UserSafe = Omit<User, 'password'>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findAll(): Promise<UserSafe[]> {
    const users = await this.repo.find({ order: { id: 'ASC' } });
    return users.map(({ password: _, ...safe }) => safe);
  }

  async create(dto: {
    nombre: string;
    email: string;
    password: string;
    cajaAsignada?: number;
  }): Promise<UserSafe> {
    const exists = await this.repo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hash,
      role: 'operador',
      cajaAsignada: dto.cajaAsignada ?? null,
      activo: true,
    });
    const saved = await this.repo.save(user);
    const { password: _, ...safe } = saved;
    return safe;
  }

  async update(
    id: number,
    dto: { nombre?: string; cajaAsignada?: number | null; activo?: boolean },
  ): Promise<UserSafe> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    const { password: _, ...safe } = saved;
    return safe;
  }

  async remove(id: number): Promise<void> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.repo.save({ ...user, activo: false });
  }
}
