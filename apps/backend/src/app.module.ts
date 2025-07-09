import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { PrismaModule } from './db/prisma.module';
import { IdModule } from './id/id.module';
import { OAuthModule } from './oauth/oauth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    /* Modules for Setup & Dependencies */
    ConfigModule,
    PrismaModule,
    IdModule,
    /* Modules for Endpoints */
    UserModule,
    OAuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
