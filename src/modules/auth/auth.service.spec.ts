import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import * as bcrypt from 'bcrypt';

// simple mock user type for testing
interface MockUser extends Omit<User, 'roles'> {
  roles: Partial<Role>[];
}

// create test user with default values
const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: '1',
  email: 'test@example.com',
  password: 'hashedPassword',
  salt: 'testSalt',
  isActive: true,
  roles: [{ id: 'role-1', name: 'user' }],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: undefined,
  updatedBy: undefined,
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let mockUser: MockUser;

  // setup logger mocks
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(jest.fn());
  });

  // setup test module before each test
  beforeEach(async () => {
    mockUser = createMockUser();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should return token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as unknown as User);
      (mockUser.validatePassword as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ token: 'mock.jwt.token' });
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should check password with bcrypt', async () => {
      const password = 'testPassword';
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const testUser = createMockUser({
        password: hashedPassword,
        salt,
        validatePassword: async (pwd: string) => bcrypt.compare(pwd, hashedPassword),
      });

      expect(await testUser.validatePassword(password)).toBe(true);
      expect(await testUser.validatePassword('wrongPassword')).toBe(false);
    });

    it('should reject inactive users', async () => {
      const inactiveUser = createMockUser({ isActive: false });
      usersService.findByEmail.mockResolvedValue(inactiveUser as unknown as User);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('invalid credentials or inactive account'),
      );
    });

    it('should reject invalid credentials', async () => {
      const user = createMockUser();
      user.validatePassword = jest.fn().mockResolvedValue(false);
      usersService.findByEmail.mockResolvedValue(user as unknown as User);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('invalid credentials'),
      );
    });

    it('should handle database errors', async () => {
      usersService.findByEmail.mockRejectedValue(new Error('Database error'));
      await expect(service.login(loginDto)).rejects.toThrow('Database error');
    });
  });
});
