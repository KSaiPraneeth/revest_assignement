import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { JwtPayload } from '../../common/interfaces/auth.interface';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(
    email: string,
    password: string,
    ip?: string,
  ): Promise<{ accessToken: string; user: Omit<UserEntity, 'password'> }> {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.signToken(user);
    const { password: _, ...safeUser } = user;

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'user',
      entityId: user.id,
      ip,
    });

    return { accessToken: token, user: safeUser };
  }

  async register(
    data: {
      fullName: string;
      email: string;
      password: string;
      gender?: string;
    },
    ip?: string,
  ): Promise<{ accessToken: string; user: Omit<UserEntity, 'password'> }> {
    const user = await this.usersService.register(data);
    const token = this.signToken(user);
    const { password: _, ...safeUser } = user;

    await this.auditService.log({
      userId: user.id,
      action: 'REGISTER',
      entity: 'user',
      entityId: user.id,
      ip,
    });

    return { accessToken: token, user: safeUser };
  }

  private signToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    return this.jwtService.sign(payload);
  }
}
