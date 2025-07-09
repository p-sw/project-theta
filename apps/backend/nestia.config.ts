import fastifyCookie from '@fastify/cookie';
import { INestiaConfig } from '@nestia/sdk';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './src/app.module';

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api');
    app.use(fastifyCookie);
    return app;
  },
  output: 'api',
  clone: true,
  propagate: true,
  distribute: '../../packages/sdk',
};
export default NESTIA_CONFIG;
