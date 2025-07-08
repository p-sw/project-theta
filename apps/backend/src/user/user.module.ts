import { Module } from '@nestjs/common';

import { OAuthModule } from '@/oauth/oauth.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [OAuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
