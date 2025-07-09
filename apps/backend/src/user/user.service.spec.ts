import { Test, TestingModule } from '@nestjs/testing';

import { random } from 'typia';

import { PrismaService } from '@/db/prisma.service';
import { IdService } from '@/id/id.service';
import {
  DiscordAccessTokenReturn,
  DiscordUserInfoResponse,
} from '@/oauth/providers/discord.types';
import {
  GithubAccessTokenCodeReturn,
  GithubUserInfoResponse,
} from '@/oauth/providers/github.types';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  let idService: IdService;
  const mockPrisma = {
    discordOAuth: {
      findUnique: jest.fn(),
    },
    githubOAuth: {
      findUnique: jest.fn(),
    },
    user: {
      create: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IdService,
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    idService = module.get<IdService>(IdService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserIdByOAuth', () => {
    it('should return user ID for discord user if found', async () => {
      const userData = random<DiscordUserInfoResponse>();
      const userId = random<string>();

      mockPrisma.discordOAuth.findUnique.mockResolvedValueOnce({
        user: { id: userId },
      });

      const result = await service.getUserIdByOAuth('discord', userData);

      expect(result).toBe(userId);
      expect(prisma.discordOAuth.findUnique).toHaveBeenCalledWith({
        where: { id: userData.id },
        select: { user: { select: { id: true } } },
      });
    });

    it('should return null for discord user if not found', async () => {
      const userData = random<DiscordUserInfoResponse>();

      mockPrisma.discordOAuth.findUnique.mockResolvedValueOnce(null);

      const result = await service.getUserIdByOAuth('discord', userData);

      expect(result).toBeNull();
      expect(prisma.discordOAuth.findUnique).toHaveBeenCalledWith({
        where: { id: userData.id },
        select: { user: { select: { id: true } } },
      });
    });

    it('should return user ID for github user if found', async () => {
      const userData = random<GithubUserInfoResponse>();
      const userId = random<string>();

      mockPrisma.githubOAuth.findUnique.mockResolvedValueOnce({
        user: { id: userId },
      });

      const result = await service.getUserIdByOAuth('github', userData);

      expect(result).toBe(userId);
      expect(prisma.githubOAuth.findUnique).toHaveBeenCalledWith({
        where: { id: userData.id.toString() },
        select: { user: { select: { id: true } } },
      });
    });

    it('should return null for github user if not found', async () => {
      const userData = random<GithubUserInfoResponse>();

      mockPrisma.githubOAuth.findUnique.mockResolvedValueOnce(null);

      const result = await service.getUserIdByOAuth('github', userData);

      expect(result).toBeNull();
      expect(prisma.githubOAuth.findUnique).toHaveBeenCalledWith({
        where: { id: userData.id.toString() },
        select: { user: { select: { id: true } } },
      });
    });
  });

  describe('createUserByOAuth', () => {
    it('should create a new user via discord oauth', async () => {
      const oauthUserId = random<DiscordUserInfoResponse['id']>();
      const tokenInfo = random<DiscordAccessTokenReturn>();
      const newUserId = random<string>();

      const result = await service.createUserByOAuth(
        'discord',
        oauthUserId,
        tokenInfo,
      );

      expect(result).toBe(newUserId);
      expect(idService.generate).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: newUserId,
          discord: {
            create: {
              id: oauthUserId,
              accessToken: tokenInfo.accessToken,
              expiresAt: new Date(tokenInfo.expiresAt),
              refreshToken: tokenInfo.refreshToken,
              scope: tokenInfo.scope,
            },
          },
        },
      });
    });

    it('should create a new user via github oauth', async () => {
      const oauthUserId = random<GithubUserInfoResponse['id']>();
      const tokenInfo = random<GithubAccessTokenCodeReturn>();
      const newUserId = random<string>();

      const result = await service.createUserByOAuth(
        'github',
        oauthUserId,
        tokenInfo,
      );

      expect(result).toBe(newUserId);
      expect(idService.generate).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: newUserId,
          github: {
            create: {
              id: oauthUserId.toString(),
              accessToken: tokenInfo.accessToken,
              scope: tokenInfo.scope,
            },
          },
        },
      });
    });
  });

  describe('createSession', () => {
    it('should create a user session and return session id', async () => {
      const userId = random<string>();
      const newSessionId = random<string>();

      const result = await service.createSession(userId);

      expect(result).toBe(newSessionId);
      expect(idService.generate).toHaveBeenCalledTimes(1);
      expect(prisma.userSession.create).toHaveBeenCalledWith({
        data: {
          id: newSessionId,
          userId,
        },
      });
    });
  });
});
