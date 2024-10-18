import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(email: string, password: string) {
    // Some logic to get user from db and validate password

    const payload = { email, name: 'test' };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
