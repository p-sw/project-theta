import { Module } from '@nestjs/common';

import { OAuthService } from './oauth.service';
import { DiscordProvider } from './providers/discord.provider';
import { GitHubProvider } from './providers/github.provider';

@Module({
  imports: [],
  providers: [OAuthService, GitHubProvider, DiscordProvider],
  exports: [OAuthService],
})
export class OAuthModule {}
