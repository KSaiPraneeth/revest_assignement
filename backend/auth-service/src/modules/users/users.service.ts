import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/interfaces/auth.interface';
import { AuditService } from '../audit/audit.service';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit(): Promise<void> {
    const admin = await this.usersRepository.findByEmail('admin@revest.sa');
    if (!admin) {
      const password = await bcrypt.hash('Admin@123', 10);
      await this.usersRepository.save(
        this.usersRepository.create({
          fullName: 'System Admin',
          email: 'admin@revest.sa',
          password,
          role: UserRole.ADMIN,
          active: true,
        }),
      );
    }
  }

  async findAll(): Promise<Omit<UserEntity, 'password'>[]> {
    const users = await this.usersRepository.findAll();
    return users.map(({ password: _pw, ...user }) => user);
  }

  async findById(id: string): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const { password: _, ...safe } = user;
    return safe;
  }

  async updateUser(
    id: string,
    data: Partial<Pick<UserEntity, 'active' | 'role' | 'fullName'>>,
    actorId: string,
    ip?: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, data);
    const saved = await this.usersRepository.save(user);

    await this.auditService.log({
      userId: actorId,
      action: 'USER_UPDATE',
      entity: 'user',
      entityId: id,
      metadata: data as Record<string, unknown>,
      ip,
    });

    const { password: _, ...safe } = saved;
    return safe;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || !user.active) return null;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    gender?: string;
  }): Promise<UserEntity> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hash = await bcrypt.hash(data.password, 10);
    return this.usersRepository.save(
      this.usersRepository.create({
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        password: hash,
        gender: data.gender,
        role: UserRole.USER,
        active: true,
      }),
    );
  }
}
