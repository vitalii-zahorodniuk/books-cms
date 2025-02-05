import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/auth.decorators';
import { TrackActivity } from 'src/decorators/track-activity.decorator';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @TrackActivity('user_login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @TrackActivity('user_register')
  async register() {
    throw new Error('Not implemented');
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @TrackActivity('reset_password_request')
  async resetPassword() {
    throw new Error('Not implemented');
  }
}
