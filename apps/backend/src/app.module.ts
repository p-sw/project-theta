import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppMiddleware } from './app.middleware';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
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
    AuthModule,
    OAuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes('*paths');
  }
}
