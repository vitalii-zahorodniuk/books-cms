import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// core jwt payload structure
interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// simplified user data for token validation
interface UserPayload {
  id: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // ensure jwt secret is available
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    // init passport with jwt options
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // extract user data from validated token
  async validate(payload: JwtPayload): Promise<UserPayload> {
    return { id: payload.sub, email: payload.email };
  }
}
