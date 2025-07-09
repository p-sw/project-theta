import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { ConsoleLogger } from 'nestlogged-fastify';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: new ConsoleLogger(),
    },
  );
  app.setGlobalPrefix('api');
  const config = app.get(ConfigService);
  await app.register(fastifyCookie);
  await app.listen(config.get('BACKEND_PORT'));
}
void bootstrap();
