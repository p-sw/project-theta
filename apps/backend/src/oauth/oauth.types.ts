import {
  DiscordAccessTokenReturn,
  DiscordUserInfoResponse,
} from './providers/discord.types';
import {
  GithubAccessTokenCodeReturn,
  GithubUserInfoResponse,
} from './providers/github.types';

export type OAuthProvider = 'github' | 'discord';

export interface OAuthRedirectUriParams {
  code: string;
}

export type AccessTokenReturn =
  | DiscordAccessTokenReturn
  | GithubAccessTokenCodeReturn;

export type UserInfoResponse = DiscordUserInfoResponse | GithubUserInfoResponse;
