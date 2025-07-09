import { Module } from '@nestjs/common';

import { OAuthModule } from '@/oauth/oauth.module';

import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [OAuthModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
