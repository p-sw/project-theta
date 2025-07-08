import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { ConsoleLogger } from 'nestlogged-fastify';

import { AppModule } from './app.module';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: new ConsoleLogger(),
    },
  );
  const config = app.get(ConfigService<Config>);
  await app.register(fastifyCookie);
  await app.listen(config.getOrThrow('BACKEND_PORT', { infer: true }));
}
void bootstrap();
