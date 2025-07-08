import {
  InjectLogger,
  Logged,
  LoggedInjectable,
  Returns,
  ScopedLogger,
} from 'nestlogged-fastify';

import { PrismaService } from '@/db/prisma.service';
import { IdService } from '@/id/id.service';

import { DiscordProvider } from './providers/discord.provider';
import { GitHubProvider } from './providers/github.provider';

export enum OAuthProvider {
  GITHUB = 'github',
  DISCORD = 'discord',
}

export interface OAuthSessionInfo {
  sessionId: string;
  sessionSecret: string;
}

@LoggedInjectable()
export class OAuthService {
  constructor(
    private readonly idService: IdService,
    private readonly prisma: PrismaService,
    private readonly githubProvider: GitHubProvider,
    private readonly discordProvider: DiscordProvider,
  ) {}

  @Returns({ id: 'sessionId' })
  createSessionID(): OAuthSessionInfo {
    return {
      sessionId: this.idService.generate(),
      sessionSecret: this.idService.cryptoGenerate(),
    };
  }

  getAuthUrl(provider: OAuthProvider.GITHUB, sessionId: string): string;
  getAuthUrl(
    provider: OAuthProvider.DISCORD,
    sessionId: string,
    prompt: 'consent' | 'none',
  ): string;
  getAuthUrl(
    @Logged('provider') provider: OAuthProvider,
    @Logged('sessionId') sessionId: string,
    @Logged('prompt') prompt?: 'consent' | 'none',
    @InjectLogger _logger?: ScopedLogger,
  ) {
    switch (provider) {
      case OAuthProvider.GITHUB:
        return this.githubProvider.getAuthUrl(sessionId, _logger);
      case OAuthProvider.DISCORD:
        return this.discordProvider.getAuthUrl(sessionId, prompt!, _logger);
    }
  }

  async isValidSession(
    state: string,
    cookieSecret: string,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    const session = await this.prisma.oAuthSession.findUnique({
      where: {
        id: state,
      },
      select: {
        secret: true,
      },
    });

    return !!session && session.secret === cookieSecret;
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
