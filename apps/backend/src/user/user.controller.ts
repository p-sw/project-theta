import {
  TypedException,
  TypedParam,
  TypedQuery,
  TypedRoute,
} from '@nestia/core';
import {
  BadRequestException,
  InternalServerErrorException,
  Res,
} from '@nestjs/common';

import { FastifyReply } from 'fastify';
import {
  InjectLogger,
  Logged,
  LoggedController,
  Returns,
  ScopedLogger,
} from 'nestlogged-fastify';

import { OAuthService } from '@/oauth/oauth.service';
import { OAuthProvider } from '@/oauth/oauth.types';

import { SubmitOAuthSession } from './user.dto';
import { UserService } from './user.service';

@LoggedController('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly oauthService: OAuthService,
  ) {}

  /**
   * Starts Authentication OAuth flow by giving the user the URL to redirect to.
   *
   * @summary Request OAuth (Auth)
   * @tag Auth
   * @tag OAuth
   *
   * @param provider The OAuth provider to use.
   * @returns The URL to redirect to for OAuth authentication.
   */
  @TypedRoute.Get('auth/:provider')
  @Returns('url')
  requestOAuthSession(
    @Logged('provider') @TypedParam('provider') provider: OAuthProvider,
    @InjectLogger _logger: ScopedLogger,
  ): string {
    return this.oauthService.getAuthUrl(provider, 'none', _logger);
  }

  /**
   * Sign in by submitting the OAuth callback from the OAuth provider.
   *
   * If user is not found, automatically creates a new user and sign in.
   *
   * @summary Submit OAuth (Auth)
   * @tag Auth
   * @tag OAuth
   *
   * @param provider The OAuth provider to use.
   * @param query URL search params from OAuth provider.
   * @returns Session ID will be set in cookie as httpOnly.
   */
  @TypedRoute.Get('auth/:provider/submit')
  @TypedException<SubmitOAuthSession.InvalidOAuthCodeException>({
    status: 400,
    description: 'Invalid OAuth code, cannot get access token',
  })
  @TypedException<SubmitOAuthSession.UserInfoFetchFailedException>({
    status: 500,
    description: 'Failed to fetch user info from oauth provider',
  })
  @TypedException<SubmitOAuthSession.IdNotFoundException>({
    status: 500,
    description:
      'Successfully fetched oauth info, but failed to find user id in oauth response',
  })
  async submitOAuthSession(
    @Logged('provider') @TypedParam('provider') provider: OAuthProvider,
    @TypedQuery() query: SubmitOAuthSession.Query,
    @Res({ passthrough: true }) res: FastifyReply,
    @InjectLogger _logger: ScopedLogger,
  ): Promise<void> {
    // try get id from oauth provider
    const accessTokenTry = await this.oauthService.getAccessToken(
      provider,
      query.code,
      _logger,
    );

    // if failed to get access token, throw error
    if (!accessTokenTry.ok) {
      throw new BadRequestException({
        code: 'invalid_oauth_code',
      });
    }

    // we have access token, try to get oauth user info
    const oauthUser = await this.oauthService.getUserInfo(
      provider,
      accessTokenTry.data.accessToken,
      _logger,
    );

    // if failed to get oauth user info, throw error
    if (!oauthUser.ok) {
      if (oauthUser.code === 'user_info_fetch_failed') {
        throw new InternalServerErrorException({
          code: 'user_info_fetch_failed',
          error: {
            httpStatus: oauthUser.error.status,
          },
        });
      }
      if (oauthUser.code === 'id_not_found') {
        throw new InternalServerErrorException({
          code: 'id_not_found',
          error: {
            responseJson: oauthUser.error,
          },
        });
      }
    }

    // now we have oauth user info, get user id from db by oauth user id
    let userId = await this.userService.getUserIdByOAuth(
      provider,
      oauthUser.data,
      _logger,
    );

    if (!userId) {
      // if user not found, create a new user
      userId = await this.userService.createUserByOAuth(
        provider,
        oauthUser.data.id,
        accessTokenTry.data,
        _logger,
      );
    }

    // now we have user id, create session
    const sessionId = await this.userService.createSession(userId, _logger);
    res.setCookie('session', sessionId, {
      httpOnly: true,
      secure: 'auto',
      sameSite: 'lax',
    });

    return;
  }
}
