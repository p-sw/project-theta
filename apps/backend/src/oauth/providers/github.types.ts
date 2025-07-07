export interface GitHubOAuthRedirectUriParams {
  code: string;
  state: string;
}

export interface GithubAccessTokenCodeRequestBody {
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri: string;
}

export interface GithubAccessTokenCodeResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

export interface GithubAccessTokenCodeReturn {
  accessToken: string;
  scope: string;
  tokenType: string;
}

export interface GithubUserInfoResponse {
  id: number;
}
