import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Config>);
  await app.listen(config.getOrThrow('BACKEND_PORT', { infer: true }));
}
void bootstrap();
