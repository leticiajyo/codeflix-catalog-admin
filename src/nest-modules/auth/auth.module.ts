import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Global()
@Module({
  // // Option to generate token with symetric key
  // imports: [
  //   JwtModule.register({
  //     // global: true
  //     secret: '123456',
  //     signOptions: { expiresIn: '60s' },
  //   }),
  // ],

  // // Option to generate token with assymetric key or keycloak
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          privateKey: configService.get('JWT_PRIVATE_KEY'),
          publicKey: configService.get('JWT_PUBLIC_KEY'),
          signOptions: {
            algorithm: 'RS256',
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
  ],
  providers: [AuthGuard, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
