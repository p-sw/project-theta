import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import envLoader from './config';
import { PrismaModule } from './db/prisma.module';
import { IdModule } from './id/id.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    /* Modules for Setup & Dependencies */
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      ignoreEnvFile: true,
      load: [envLoader],
    }),
    PrismaModule,
    IdModule,
    /* Modules for Endpoints */
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
