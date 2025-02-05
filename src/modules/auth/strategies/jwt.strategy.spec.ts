import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

// test jwt strategy implementation
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  // check error handling for missing secret
  it('should throw error if JWT_SECRET is not defined', () => {
    configService.get.mockReturnValue(undefined);

    expect(() => {
      new JwtStrategy(configService);
    }).toThrow('JWT_SECRET is not defined');
  });

  // test payload validation
  describe('validate', () => {
    it('should return user payload from jwt payload', async () => {
      const payload = {
        sub: '123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: payload.sub,
        email: payload.email,
      });
    });
  });
});
