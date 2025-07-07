import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import envLoader from './config';
import { PrismaModule } from './db/prisma.module';
import { IdModule } from './id/id.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      ignoreEnvFile: true,
      load: [envLoader],
    }),
    PrismaModule,
    IdModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
