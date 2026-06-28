import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../common/interfaces/auth.interface';
import { AuditService } from '../audit/audit.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let auditService: jest.Mocked<AuditService>;

  const mockUser = {
    id: 'user-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'hashed',
    role: UserRole.USER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      validateCredentials: jest.fn(),
      register: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    } as unknown as jest.Mocked<JwtService>;

    auditService = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('returns token and user on successful login', async () => {
    usersService.validateCredentials.mockResolvedValue(mockUser);

    const result = await service.login('jane@example.com', 'secret');

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.email).toBe('jane@example.com');
    expect(result.user).not.toHaveProperty('password');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'LOGIN', userId: mockUser.id }),
    );
  });

  it('throws UnauthorizedException for invalid credentials', async () => {
    usersService.validateCredentials.mockResolvedValue(null);

    await expect(service.login('bad@example.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('registers user and returns token', async () => {
    usersService.register.mockResolvedValue(mockUser);

    const result = await service.register({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      gender: 'Female',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: mockUser.id,
        email: mockUser.email,
        role: UserRole.USER,
      }),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'REGISTER' }),
    );
  });
});
