import {
  InjectLogger,
  Logged,
  LoggedInjectable,
  Returns,
  ScopedLogger,
} from 'nestlogged-fastify';

import { PrismaService } from '@/db/prisma.service';
import { IdService } from '@/id/id.service';
import {
  AccessTokenReturn,
  OAuthProvider,
  UserInfoResponse,
} from '@/oauth/oauth.types';
import {
  DiscordAccessTokenReturn,
  DiscordUserInfoResponse,
} from '@/oauth/providers/discord.types';
import {
  GithubAccessTokenCodeReturn,
  GithubUserInfoResponse,
} from '@/oauth/providers/github.types';

@LoggedInjectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idService: IdService,
  ) {}

  @Returns('userId')
  async getUserIdByOAuth(
    @Logged('provider') provider: OAuthProvider,
    @Logged({ oauthUserId: 'id' })
    userData: UserInfoResponse,
    @InjectLogger _logger?: ScopedLogger,
  ): Promise<string | null> {
    let id: string;

    const findForDiscord = async () => {
      _logger?.log('finding user in discord oauth');
      const discordOAuth = await this.prisma.discordOAuth.findUnique({
        where: {
          id,
        },
        select: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!discordOAuth) return null;
      return discordOAuth.user.id;
    };

    const findForGithub = async () => {
      _logger?.log('finding user in github oauth');
      const githubOAuth = await this.prisma.githubOAuth.findUnique({
        where: {
          id,
        },
        select: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!githubOAuth) return null;
      return githubOAuth.user.id;
    };

    if (provider === 'discord') {
      id = (userData as DiscordUserInfoResponse).id;
      return findForDiscord();
    } else if (provider === 'github') {
      id = (userData as GithubUserInfoResponse).id.toString();
      return findForGithub();
    }

    throw new Error('never');
  }

  @Returns('userId')
  async createUserByOAuth(
    @Logged('provider') provider: OAuthProvider,
    @Logged('oauthUserId')
    oauthUserId: DiscordUserInfoResponse['id'] | GithubUserInfoResponse['id'],
    tokenInfo: AccessTokenReturn,
    @InjectLogger _logger?: ScopedLogger,
  ): Promise<string> {
    const saveForDiscord = async () => {
      const discordTokenInfo = tokenInfo as DiscordAccessTokenReturn;
      const id = this.idService.generate();
      const discordUserId = oauthUserId as DiscordUserInfoResponse['id'];
      _logger?.log(
        `creating user for discord oauth, id ${id}, discord id ${discordUserId}`,
      );
      await this.prisma.user.create({
        data: {
          id,
          discord: {
            create: {
              id: discordUserId,
              accessToken: discordTokenInfo.accessToken,
              expiresAt: new Date(discordTokenInfo.expiresAt),
              refreshToken: discordTokenInfo.refreshToken,
              scope: discordTokenInfo.scope,
            },
          },
        },
      });

      return id;
    };

    const saveForGithub = async () => {
      const githubTokenInfo = tokenInfo as GithubAccessTokenCodeReturn;
      const id = this.idService.generate();
      const githubUserId = oauthUserId as GithubUserInfoResponse['id'];
      _logger?.log(
        `creating user for github oauth, id ${id}, github id ${githubUserId}`,
      );
      await this.prisma.user.create({
        data: {
          id,
          github: {
            create: {
              id: githubUserId.toString(),
              accessToken: githubTokenInfo.accessToken,
              scope: githubTokenInfo.scope,
            },
          },
        },
      });

      return id;
    };

    if (provider === 'discord') {
      return saveForDiscord();
    } else if (provider === 'github') {
      return saveForGithub();
    }
    throw new Error('never');
  }

  async createSession(
    @Logged('userId') userId: string,
    @InjectLogger _logger?: ScopedLogger,
  ): Promise<string> {
    const id = this.idService.generate();
    _logger?.log(`creating session for user ${userId}, id ${id}`);
    await this.prisma.userSession.create({
      data: {
        id,
        userId,
      },
    });

    return id;
  }
}
