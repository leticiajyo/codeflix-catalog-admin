import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      //global: true
      secret: '123456',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  // imports: [
  //   JwtModule.registerAsync({
  //     useFactory: (configService: ConfigService) => {
  //       return {
  //         privateKey: configService.get('JWT_PRIVATE_KEY'),
  //         publicKey: configService.get('JWT_PUBLIC_KEY'),
  //         signOptions: {
  //           algorithm: 'RS256',
  //         },
  //       };
  //     },
  //     inject: [ConfigService],
  //   }),
  // ],
  providers: [AuthGuard, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
