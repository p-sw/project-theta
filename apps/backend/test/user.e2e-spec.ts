import fastifyCookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as UserSDK from '@shared/sdk/lib/functional/api/user';

import { AppModule } from '@/app.module';

import { metadata } from './test-sdkutil';

describe('UserController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    app.setGlobalPrefix('api');
    await app.register(fastifyCookie);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    describe('OAuth', () => {
      describe('requestOAuthSession', () => {
        it('should return URL for Discord OAuth', async () => {
          return app
            .inject(
              metadata(UserSDK.auth.requestOAuthSession, {
                provider: 'discord',
              }),
            )
            .then((result) => {
              expect(result.statusCode).toBe(200);
              expect(result.body).toBeDefined();
              expect(
                result.body.startsWith('https://discord.com/oauth2/authorize?'),
              ).toBe(true);
              expect(result.body.includes('client_id=')).toBe(true);
              expect(result.body.includes('redirect_uri=')).toBe(true);
              expect(result.body.includes('response_type=code')).toBe(true);
              expect(result.body.includes('scope=')).toBe(true);
              expect(result.body.includes('prompt=')).toBe(true);
            });
        });
        it('should return URL for Github OAuth', async () => {
          return app
            .inject(
              metadata(UserSDK.auth.requestOAuthSession, {
                provider: 'github',
              }),
            )
            .then((result) => {
              expect(result.statusCode).toBe(200);
              expect(result.body).toBeDefined();
              expect(
                result.body.startsWith(
                  'https://github.com/login/oauth/authorize?',
                ),
              ).toBe(true);
              expect(result.body.includes('client_id=')).toBe(true);
              expect(result.body.includes('redirect_uri=')).toBe(true);
              expect(result.body.includes('scope=')).toBe(true);
            });
        });
      });
      /*
      describe('submitOAuthSession', () => {
        it('should return user info', async () => {
          return app
            .inject(
              metadata(UserSDK.auth.submit.submitOAuthSession, {
                provider: 'discord',
              }, {
                code: 
              }),
            )
            .then((result) => {});
        });
      });
      */
    });
  });
});
