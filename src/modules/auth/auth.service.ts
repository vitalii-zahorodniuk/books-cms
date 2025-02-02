import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // handles user authentication flow
  async login(credentials: LoginDto) {
    try {
      // verify user existence and status
      const user = await this.usersService.findByEmail(credentials.email);
      if (!user || !user.isActive) {
        this.logger.warn(
          `login attempt failed for email: ${credentials.email}`,
        );
        throw new UnauthorizedException(
          'invalid credentials or inactive account',
        );
      }

      // validate password hash
      const isValid = await user.validatePassword(credentials.password);
      if (!isValid) {
        this.logger.warn(`invalid password for user: ${user.id}`);
        throw new UnauthorizedException('invalid credentials');
      }

      // generate jwt with minimal payload
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      this.logger.debug(`successful login for user: ${user.id}`);
      return { token };
    } catch (error) {
      this.logger.error('authentication failed', error.stack);
      throw error;
    }
  }
}
