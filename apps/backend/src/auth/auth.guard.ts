import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FastifyRequest } from 'fastify';
import { InjectLogger, LoggedGuard, ScopedLogger } from 'nestlogged-fastify';

import { AuthService } from './auth.service';

export const SKIP_AUTHENTICATION = 'SKIP_AUTHENTICATION';
export const SkipAuth = () => SetMetadata(SKIP_AUTHENTICATION, true);

export const SESSION_COOKIE = 'session';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  @LoggedGuard()
  async canActivate(
    context: ExecutionContext,
    @InjectLogger logger?: ScopedLogger,
  ): Promise<boolean> {
    const isSkipped = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUTHENTICATION,
      [context.getHandler(), context.getClass()],
    );
    if (isSkipped) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = request.cookies[SESSION_COOKIE];
    if (!token) {
      logger?.log('No session cookie found');
      return false;
    }

    const userId = await this.authService.getUserIdBySession(token);
    if (userId === null) {
      logger?.log('Invalid session cookie found');
      return false;
    }

    return true;
  }
}
