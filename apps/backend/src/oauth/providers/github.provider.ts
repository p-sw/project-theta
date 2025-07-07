import { ConfigService } from '@nestjs/config';

import {
  InjectLogger,
  Logged,
  LoggedFunction,
  LoggedInjectable,
  Returns,
  ScopedLogger,
} from 'nestlogged-fastify';

import { Config } from '@/config';
import { ErrorFunc, PossiblyError, SuccessFunc, error, ok } from '@/error';

import {
  GitHubOAuthRedirectUriParams,
  GithubAccessTokenCodeRequestBody,
  GithubAccessTokenCodeResponse,
  GithubAccessTokenCodeReturn,
  GithubUserInfoResponse,
} from './github.types';

@LoggedInjectable({
  logOptions: { callLogLevel: 'debug', returnLogLevel: 'debug' },
})
export class GitHubProvider {
  private readonly baseUrl = 'https://github.com/login/oauth';
  private readonly authorizeUrl = `${this.baseUrl}/authorize`;
  private readonly tokenUrl = `${this.baseUrl}/access_token`;
  private readonly apiUrl = 'https://api.github.com';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService<Config>) {
    this.clientId = this.configService.getOrThrow('GITHUB_CLIENT_ID', {
      infer: true,
    });
    this.clientSecret = this.configService.getOrThrow('GITHUB_CLIENT_SECRET', {
      infer: true,
    });
    this.redirectUri = this.configService.getOrThrow('GITHUB_REDIRECT_URI', {
      infer: true,
    });
  }

  @Returns('scopestring')
  private getScopeFormat(
    @Logged('scopes') scopes: string[],
    @InjectLogger _logger: ScopedLogger,
  ): string {
    return scopes.join(' ');
  }

  /**
   * @param sessionId - state에 포함되는 보안용 ID입니다. OAuthSession 테이블의 id값입니다.
   */
  @LoggedFunction({ callLogLevel: 'log' })
  @Returns('url')
  getAuthUrl(
    @Logged('sessionId') sessionId: string,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    const url = new URL(this.authorizeUrl);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('scope', this.getScopeFormat(['user'], _logger!));
    url.searchParams.set('state', sessionId);

    return url.toString();
  }

  @Returns({
    requestSuccess: 'ok',
    failureReason: 'code',
    successData: 'data',
    failureData: 'error',
  })
  private async requestForToken(
    @Logged('uri') uri: typeof this.tokenUrl,
    @Logged('data')
    data: GithubAccessTokenCodeRequestBody,
    @InjectLogger _logger?: ScopedLogger,
  ): Promise<
    PossiblyError<
      { token_exchange_failed: { status: number } },
      GithubAccessTokenCodeReturn
    >
  > {
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(
        data as unknown as Record<
          string,
          string
        > /* WHAT THE FUCK TYPESCRIPT ARE YOU SERIOUS */,
      ).toString(),
    });
    if (!response.ok) {
      return error<ErrorFunc<typeof this.requestForToken>>(
        'token_exchange_failed',
        { status: response.status },
      );
    }

    const tokenData = (await response.json()) as GithubAccessTokenCodeResponse;

    return ok<SuccessFunc<typeof this.requestForToken>>({
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
    });
  }

  @LoggedFunction({ callLogLevel: 'log' })
  @Returns({
    success: 'ok',
    failureReason: 'code',
  })
  async getAccessToken(
    data: Pick<GitHubOAuthRedirectUriParams, 'code'>,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    const tokenExchange = await this.requestForToken(
      this.tokenUrl,
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: data.code,
        redirect_uri: this.redirectUri,
      },
      _logger,
    );

    return tokenExchange;
  }

  @LoggedFunction({ callLogLevel: 'log' })
  @Returns({
    success: 'ok',
    failureReason: 'code',
  })
  async getUserInfo(
    accessToken: string,
    @InjectLogger _logger?: ScopedLogger,
  ): Promise<
    PossiblyError<
      { user_info_fetch_failed: { status: number } },
      GithubUserInfoResponse
    >
  > {
    const userResponse = await fetch(`${this.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!userResponse.ok) {
      return error<ErrorFunc<typeof this.getUserInfo>>(
        'user_info_fetch_failed',
        { status: userResponse.status },
      );
    }

    const user: GithubUserInfoResponse =
      (await userResponse.json()) as GithubUserInfoResponse;

    return ok<SuccessFunc<typeof this.getUserInfo>>(user);
  }
}
