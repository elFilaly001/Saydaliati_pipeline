import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '@/firebase/firebase.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '@/mail/mail.module';
import { MailService } from '@/mail/mail.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    FirebaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, MailModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
