export type OAuthProvider = 'github' | 'discord';

export interface OAuthRedirectUriParams {
  code: string;
}
