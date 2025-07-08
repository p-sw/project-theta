import {
  InjectLogger,
  Logged,
  LoggedInjectable,
  Returns,
  ScopedLogger,
} from 'nestlogged-fastify';

import { DiscordProvider } from './providers/discord.provider';
import { GitHubProvider } from './providers/github.provider';

export enum OAuthProvider {
  GITHUB = 'github',
  DISCORD = 'discord',
}

@LoggedInjectable()
export class OAuthService {
  constructor(
    private readonly githubProvider: GitHubProvider,
    private readonly discordProvider: DiscordProvider,
  ) {}

  getAuthUrl(provider: OAuthProvider.GITHUB, sessionId: string): string;
  getAuthUrl(
    provider: OAuthProvider.DISCORD,
    sessionId: string,
    prompt: 'consent' | 'none',
  ): string;
  @Returns('url')
  getAuthUrl(
    @Logged('provider') provider: OAuthProvider,
    @Logged('sessionId') sessionId: string,
    @Logged('prompt') prompt?: 'consent' | 'none',
    @InjectLogger _logger?: ScopedLogger,
  ): string {
    switch (provider) {
      case OAuthProvider.GITHUB:
        return this.githubProvider.getAuthUrl(sessionId, _logger);
      case OAuthProvider.DISCORD:
        return this.discordProvider.getAuthUrl(sessionId, prompt!, _logger);
    }
  }

  async getAccessToken(
    provider: OAuthProvider,
    code: string,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    switch (provider) {
      case OAuthProvider.GITHUB:
        return this.githubProvider.getAccessToken({ code }, _logger);
      case OAuthProvider.DISCORD:
        return this.discordProvider.getAccessToken({ code }, _logger);
    }
  }

  async getUserInfo(
    provider: OAuthProvider,
    accessToken: string,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    switch (provider) {
      case OAuthProvider.GITHUB:
        return this.githubProvider.getUserInfo(accessToken, _logger);
      case OAuthProvider.DISCORD:
        return this.discordProvider.getUserInfo(accessToken, _logger);
    }
  }
}
