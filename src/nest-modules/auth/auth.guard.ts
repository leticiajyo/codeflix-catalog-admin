import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // // Option to generate token with symetric key
      // const payload = this.jwtService.verify(token, { secret: '123456' });

      // // Option to generate token with assymetric key or keycloak
      const payload = this.jwtService.verify(token);

      request['user'] = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
