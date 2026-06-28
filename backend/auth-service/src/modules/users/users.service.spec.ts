import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/interfaces/auth.interface';
import { AuditService } from '../audit/audit.service';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (user) => ({ ...user, id: 'new-user-id' })),
    } as unknown as jest.Mocked<UsersRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
        { provide: AuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('rejects duplicate email on register', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 'existing',
      email: 'taken@example.com',
    } as never);

    await expect(
      service.register({
        fullName: 'Test User',
        email: 'taken@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('hashes password and stores lowercase email on register', async () => {
    repository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const user = await service.register({
      fullName: 'Test User',
      email: 'User@Example.COM',
      password: 'password123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        password: 'hashed-password',
        role: UserRole.USER,
      }),
    );
    expect(user.id).toBe('new-user-id');
  });

  it('returns null when credentials are invalid', async () => {
    repository.findByEmail.mockResolvedValue(null);

    const result = await service.validateCredentials('a@b.com', 'pass');
    expect(result).toBeNull();
  });

  it('returns user when password matches', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      password: 'hash',
      active: true,
    } as never);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateCredentials('a@b.com', 'pass');
    expect(result?.id).toBe('u1');
  });
});
