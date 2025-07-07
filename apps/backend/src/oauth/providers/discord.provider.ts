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
  DiscordAccessTokenCodeRequestBody,
  DiscordAccessTokenRefreshRequestBody,
  DiscordAccessTokenResponse,
  DiscordAccessTokenReturn,
  DiscordOAuthRedirectUriParams,
  DiscordUserInfoResponse,
} from './discord.types';

@LoggedInjectable({
  logOptions: { callLogLevel: 'debug', returnLogLevel: 'debug' },
})
export class DiscordProvider {
  private readonly baseUrl = 'https://discord.com/oauth2/authorize';
  private readonly apiUrl = 'https://discord.com/api/v10';
  private readonly tokenUrl = `${this.apiUrl}/oauth2/token`;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService<Config>) {
    this.clientId = this.configService.getOrThrow('DISCORD_CLIENT_ID', {
      infer: true,
    });
    this.clientSecret = this.configService.getOrThrow('DISCORD_CLIENT_SECRET', {
      infer: true,
    });
    this.redirectUri = this.configService.getOrThrow('DISCORD_REDIRECT_URI', {
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

  @Returns('HTTPBasicAuth')
  private clientBasicAuth(@InjectLogger _logger: ScopedLogger): string {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * @param sessionId - state에 포함되는 보안용 ID입니다. OAuthSession 테이블의 id값입니다.
   * @param prompt 'consent'일 경우 사용자가 권한을 허가했어도 다시 디스코드 권한 허가 페이지를 보여줍니다. 스코프를 업데이트 할 때 사용합니다. 'none'일 경우 사용자가 이미 권한을 허가한 경우 디스코드 권한 허가 페이지를 건너뜁니다. 로그인 시 등에 사용합니다.
   */
  @LoggedFunction({ callLogLevel: 'log' })
  @Returns('url')
  getAuthUrl(
    @Logged('sessionId') sessionId: string,
    @Logged('prompt') prompt: 'consent' | 'none',
    @InjectLogger _logger?: ScopedLogger,
  ): string {
    const url = new URL(this.baseUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('scope', this.getScopeFormat(['identify'], _logger!));
    url.searchParams.set('state', sessionId);
    url.searchParams.set('prompt', prompt);

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
    data:
      | DiscordAccessTokenCodeRequestBody
      | DiscordAccessTokenRefreshRequestBody,
    @InjectLogger _logger?: ScopedLogger,
  ): Promise<
    PossiblyError<
      { token_exchange_failed: { status: number } },
      DiscordAccessTokenReturn
    >
  > {
    const tokenExchangeTime = Date.now();
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.clientBasicAuth(_logger!),
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

    const tokenData = (await response.json()) as DiscordAccessTokenResponse;

    return ok<SuccessFunc<typeof this.requestForToken>>({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenExchangeTime + tokenData.expires_in * 1000,
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
    data: Pick<DiscordOAuthRedirectUriParams, 'code'>,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    const tokenExchange = await this.requestForToken(
      this.tokenUrl,
      {
        grant_type: 'authorization_code',
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
  async refreshAccessToken(
    refreshToken: string,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    const tokenExchange = await this.requestForToken(
      this.tokenUrl,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
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
      {
        user_info_fetch_failed: { status: number };
        id_not_found: Record<string, any>;
      },
      DiscordUserInfoResponse
    >
  > {
    const userResponse = await fetch(`${this.apiUrl}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return error<ErrorFunc<typeof this.getUserInfo>>(
        'user_info_fetch_failed',
        { status: userResponse.status },
      );
    }

    const user: DiscordUserInfoResponse =
      (await userResponse.json()) as DiscordUserInfoResponse;

    if (!user.id) {
      return error<ErrorFunc<typeof this.getUserInfo>>('id_not_found', user);
    }

    return ok<SuccessFunc<typeof this.getUserInfo>>(user);
  }
}
