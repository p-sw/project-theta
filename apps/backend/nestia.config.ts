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
  swagger: {
    openapi: '3.1',
    output: 'api/swagger.json',
    operationId: (props) => {
      return `${props.class}.${props.function}`;
    },
    security: {
      bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'OAuth',
        description: 'OAuth endpoints',
      },
    ],
    beautify: true,
    additional: true,
    info: {
      title: 'Backend',
      description: 'Backend API',
      version: '0.0.1',
    },
  },
};
export default NESTIA_CONFIG;
