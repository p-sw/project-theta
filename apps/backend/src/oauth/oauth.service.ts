import {
  InjectLogger,
  Logged,
  LoggedInjectable,
  Returns,
  ScopedLogger,
} from 'nestlogged-fastify';

import { DiscordProvider } from './providers/discord.provider';
import { GitHubProvider } from './providers/github.provider';

export type OAuthProvider = 'github' | 'discord';

@LoggedInjectable()
export class OAuthService {
  constructor(
    private readonly githubProvider: GitHubProvider,
    private readonly discordProvider: DiscordProvider,
  ) {}

  @Returns('url')
  getAuthUrl(
    @Logged('provider') provider: OAuthProvider,
    @Logged('prompt') prompt?: 'consent' | 'none',
    @InjectLogger _logger?: ScopedLogger,
  ): string {
    switch (provider) {
      case 'github':
        return this.githubProvider.getAuthUrl(_logger);
      case 'discord':
        return this.discordProvider.getAuthUrl(prompt!, _logger);
    }
  }

  @Returns({ success: 'ok', failureReason: 'code' })
  async getAccessToken(
    @Logged('provider') provider: OAuthProvider,
    @Logged('code') code: string,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    switch (provider) {
      case 'github':
        return this.githubProvider.getAccessToken({ code }, _logger);
      case 'discord':
        return this.discordProvider.getAccessToken({ code }, _logger);
    }
  }

  @Returns({ success: 'ok', failureReason: 'code' })
  async getUserInfo(
    @Logged('provider') provider: OAuthProvider,
    accessToken: string,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    switch (provider) {
      case 'github':
        return this.githubProvider.getUserInfo(accessToken, _logger);
      case 'discord':
        return this.discordProvider.getUserInfo(accessToken, _logger);
    }
  }
}
