export interface DiscordAccessTokenCodeRequestBody {
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
}

export interface DiscordAccessTokenRefreshRequestBody {
  grant_type: 'refresh_token';
  refresh_token: string;
}

export interface DiscordOAuthRedirectUriParams {
  code: string;
  state: string;
}

export interface DiscordAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordAccessTokenReturn {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
  tokenType: string;
}

export interface DiscordUserInfoResponse {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  // avatar_decoration_data
  // collectibles
  // primary_guild
}
