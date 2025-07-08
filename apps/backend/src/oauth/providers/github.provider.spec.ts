import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { random } from 'typia';

import { GitHubProvider } from './github.provider';
import {
  GithubAccessTokenCodeResponse,
  GithubUserInfoResponse,
} from './github.types';

interface MockConfig {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_REDIRECT_URI: string;
}

describe('GitHubProvider', () => {
  let provider: GitHubProvider;

  const mockConfig: MockConfig = random<MockConfig>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubProvider,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(
              (key: keyof typeof mockConfig) => mockConfig[key],
            ),
          },
        },
      ],
    }).compile();

    provider = module.get<GitHubProvider>(GitHubProvider);

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getAuthUrl', () => {
    it('should return a valid GitHub auth URL', () => {
      const sessionId = random<string>();
      const url = provider.getAuthUrl(sessionId);

      const expectedUrl = new URL('https://github.com/login/oauth/authorize');
      expectedUrl.searchParams.set('client_id', mockConfig.GITHUB_CLIENT_ID);
      expectedUrl.searchParams.set(
        'redirect_uri',
        mockConfig.GITHUB_REDIRECT_URI,
      );
      expectedUrl.searchParams.set('scope', 'user');
      expectedUrl.searchParams.set('state', sessionId);

      expect(url).toBe(expectedUrl.toString());
    });
  });

  describe('getAccessToken', () => {
    it('should return access token on successful exchange', async () => {
      const code = random<string>();
      const mockTokenResponse = random<GithubAccessTokenCodeResponse>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await provider.getAccessToken({ code });

      expect(fetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(String) as string,
        }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.accessToken).toBe(mockTokenResponse.access_token);
        expect(result.data.scope).toBe(mockTokenResponse.scope);
        expect(result.data.tokenType).toBe(mockTokenResponse.token_type);
      }
    });

    it('should return an error if token exchange fails', async () => {
      const code = random<string>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await provider.getAccessToken({ code });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('token_exchange_failed');
        expect(result.error).toEqual({ status: 400 });
      }
    });
  });

  describe('getUserInfo', () => {
    it('should return user info on success', async () => {
      const accessToken = random<string>();
      const mockUserResponse = random<GithubUserInfoResponse>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserResponse),
      });

      const result = await provider.getUserInfo(accessToken);

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual(mockUserResponse);
      }
    });

    it('should return an error if fetching user info fails', async () => {
      const accessToken = random<string>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await provider.getUserInfo(accessToken);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('user_info_fetch_failed');
        expect(result.error).toEqual({ status: 401 });
      }
    });
  });
});
