import { Test, TestingModule } from '@nestjs/testing';

import { ScopedLogger } from 'nestlogged-fastify';
import { random } from 'typia';

import { PrismaService } from '../db/prisma.service';
import { IdService } from '../id/id.service';
import { OAuthProvider, OAuthService } from './oauth.service';
import { DiscordProvider } from './providers/discord.provider';
import { GitHubProvider } from './providers/github.provider';

describe('OAuthService', () => {
  let service: OAuthService;
  let prismaService: PrismaService;
  let githubProvider: GitHubProvider;
  let discordProvider: DiscordProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: IdService,
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            oAuthSession: {
              findUnique: jest.fn(),
            },
          },
        },
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
    prismaService = module.get<PrismaService>(PrismaService);
    githubProvider = module.get<GitHubProvider>(GitHubProvider);
    discordProvider = module.get<DiscordProvider>(DiscordProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthUrl', () => {
    it('should call githubProvider for GITHUB provider', () => {
      const sessionId = random<string>();
      service.getAuthUrl(OAuthProvider.GITHUB, sessionId);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(githubProvider.getAuthUrl).toHaveBeenCalledWith(
        sessionId,
        expect.any(ScopedLogger),
      );
    });

    it('should call discordProvider for DISCORD provider', () => {
      const sessionId = random<string>();
      const prompt = 'consent';
      service.getAuthUrl(OAuthProvider.DISCORD, sessionId, prompt);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(discordProvider.getAuthUrl).toHaveBeenCalledWith(
        sessionId,
        prompt,
        expect.any(ScopedLogger),
      );
    });
  });

  describe('isValidSession', () => {
    it('should return true for a valid session', async () => {
      const state = random<string>();
      const cookieSecret = random<string>();
      (
        prismaService.oAuthSession.findUnique as jest.Mock
      ).mockResolvedValueOnce({
        secret: cookieSecret,
      });

      const isValid = await service.isValidSession(state, cookieSecret);
      expect(isValid).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.oAuthSession.findUnique).toHaveBeenCalledWith({
        where: { id: state },
        select: { secret: true },
      });
    });

    it('should return false for an invalid session', async () => {
      const state = random<string>();
      const cookieSecret = random<string>();
      (
        prismaService.oAuthSession.findUnique as jest.Mock
      ).mockResolvedValueOnce(null);

      const isValid = await service.isValidSession(state, cookieSecret);
      expect(isValid).toBe(false);
    });

    it('should return false for a session with a wrong secret', async () => {
      const state = random<string>();
      const cookieSecret = random<string>();
      (
        prismaService.oAuthSession.findUnique as jest.Mock
      ).mockResolvedValueOnce({
        secret: 'right-secret',
      });

      const isValid = await service.isValidSession(state, cookieSecret);
      expect(isValid).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should call githubProvider for GITHUB provider', async () => {
      const code = random<string>();
      await service.getAccessToken(OAuthProvider.GITHUB, code);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(githubProvider.getAccessToken).toHaveBeenCalledWith(
        { code },
        expect.any(ScopedLogger),
      );
    });

    it('should call discordProvider for DISCORD provider', async () => {
      const code = random<string>();
      await service.getAccessToken(OAuthProvider.DISCORD, code);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(discordProvider.getAccessToken).toHaveBeenCalledWith(
        { code },
        expect.any(ScopedLogger),
      );
    });
  });

  describe('getUserInfo', () => {
    it('should call githubProvider for GITHUB provider', async () => {
      const accessToken = random<string>();
      await service.getUserInfo(OAuthProvider.GITHUB, accessToken);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(githubProvider.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        expect.any(ScopedLogger),
      );
    });

    it('should call discordProvider for DISCORD provider', async () => {
      const accessToken = random<string>();
      await service.getUserInfo(OAuthProvider.DISCORD, accessToken);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(discordProvider.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        expect.any(ScopedLogger),
      );
    });
  });
});
