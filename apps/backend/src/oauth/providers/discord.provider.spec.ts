import { Test, TestingModule } from '@nestjs/testing';

import { random } from 'typia';

import { ConfigService } from '@/config/config.service';

import { DiscordProvider } from './discord.provider';
import {
  DiscordAccessTokenResponse,
  DiscordUserInfoResponse,
} from './discord.types';

interface MockConfig {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;
}

describe('DiscordProvider', () => {
  let provider: DiscordProvider;
  const mockConfig: MockConfig = random<MockConfig>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: keyof typeof mockConfig) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    provider = module.get<DiscordProvider>(DiscordProvider);

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getAuthUrl', () => {
    it('should return a valid Discord auth URL', () => {
      const prompt = 'consent';
      const url = provider.getAuthUrl(prompt);

      const expectedUrl = new URL('https://discord.com/oauth2/authorize');
      expectedUrl.searchParams.set('response_type', 'code');
      expectedUrl.searchParams.set('client_id', mockConfig.DISCORD_CLIENT_ID);
      expectedUrl.searchParams.set(
        'redirect_uri',
        mockConfig.DISCORD_REDIRECT_URI,
      );
      expectedUrl.searchParams.set('scope', 'identify');
      expectedUrl.searchParams.set('prompt', prompt);

      expect(url).toBe(expectedUrl.toString());
    });
  });

  describe('getAccessToken', () => {
    it('should return access token on successful exchange', async () => {
      const code = random<string>();
      const mockTokenResponse = random<DiscordAccessTokenResponse>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await provider.getAccessToken({ code });

      expect(fetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/oauth2/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.any(String) as string,
          },
          body: expect.any(String) as string,
        }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.accessToken).toBe(mockTokenResponse.access_token);
        expect(result.data.refreshToken).toBe(mockTokenResponse.refresh_token);
        expect(result.data.expiresAt).toBeGreaterThan(Date.now());
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

  describe('refreshAccessToken', () => {
    it('should return new access token on successful refresh', async () => {
      const refreshToken = random<string>();
      const mockTokenResponse = random<DiscordAccessTokenResponse>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await provider.refreshAccessToken(refreshToken);

      expect(fetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/oauth2/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.any(String) as string,
          },
          body: expect.any(String) as string,
        }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.accessToken).toBe(mockTokenResponse.access_token);
        expect(result.data.refreshToken).toBe(mockTokenResponse.refresh_token);
        expect(result.data.expiresAt).toBeGreaterThan(Date.now());
        expect(result.data.scope).toBe(mockTokenResponse.scope);
        expect(result.data.tokenType).toBe(mockTokenResponse.token_type);
      }
    });

    it('should return an error if refresh token is invalid', async () => {
      const refreshToken = random<string>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await provider.refreshAccessToken(refreshToken);

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
      const mockUserResponse = random<DiscordUserInfoResponse>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserResponse),
      });

      const result = await provider.getUserInfo(accessToken);

      expect(fetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/users/@me',
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
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

    it('should return an error if user id is missing', async () => {
      const accessToken = random<string>();
      const otherBody = random<{ otherValue: string }>();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(otherBody),
      });

      const result = await provider.getUserInfo(accessToken);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('id_not_found');
        expect(result.error).toEqual(otherBody);
      }
    });
  });
});
