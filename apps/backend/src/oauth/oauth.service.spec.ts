import { Test, TestingModule } from '@nestjs/testing';

import { ScopedLogger } from 'nestlogged-fastify';
import { random } from 'typia';

import { OAuthService } from './oauth.service';
import { DiscordProvider } from './providers/discord.provider';
import { GitHubProvider } from './providers/github.provider';

describe('OAuthService', () => {
  let service: OAuthService;
  let githubProvider: GitHubProvider;
  let discordProvider: DiscordProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: GitHubProvider,
          useValue: {
            getAuthUrl: jest.fn(),
            getAccessToken: jest.fn(),
            getUserInfo: jest.fn(),
          },
        },
        {
          provide: DiscordProvider,
          useValue: {
            getAuthUrl: jest.fn(),
            getAccessToken: jest.fn(),
            getUserInfo: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    githubProvider = module.get<GitHubProvider>(GitHubProvider);
    discordProvider = module.get<DiscordProvider>(DiscordProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthUrl', () => {
    it('should call githubProvider for GITHUB provider', () => {
      service.getAuthUrl('github');
      expect(githubProvider.getAuthUrl).toHaveBeenCalledWith(
        expect.any(ScopedLogger),
      );
    });

    it('should call discordProvider for DISCORD provider', () => {
      const prompt = 'consent';
      service.getAuthUrl('discord', prompt);
      expect(discordProvider.getAuthUrl).toHaveBeenCalledWith(
        prompt,
        expect.any(ScopedLogger),
      );
    });
  });

  describe('getAccessToken', () => {
    it('should call githubProvider for GITHUB provider', async () => {
      const code = random<string>();
      await service.getAccessToken('github', code);
      expect(githubProvider.getAccessToken).toHaveBeenCalledWith(
        { code },
        expect.any(ScopedLogger),
      );
    });

    it('should call discordProvider for DISCORD provider', async () => {
      const code = random<string>();
      await service.getAccessToken('discord', code);
      expect(discordProvider.getAccessToken).toHaveBeenCalledWith(
        { code },
        expect.any(ScopedLogger),
      );
    });
  });

  describe('getUserInfo', () => {
    it('should call githubProvider for GITHUB provider', async () => {
      const accessToken = random<string>();
      await service.getUserInfo('github', accessToken);
      expect(githubProvider.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        expect.any(ScopedLogger),
      );
    });

    it('should call discordProvider for DISCORD provider', async () => {
      const accessToken = random<string>();
      await service.getUserInfo('discord', accessToken);
      expect(discordProvider.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        expect.any(ScopedLogger),
      );
    });
  });
});
