import { Global, Module } from '@nestjs/common';

import envLoader, { ConfigService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: () => {
        const config = envLoader();
        return new ConfigService(config);
      },
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
