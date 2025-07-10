import { Injectable, NestMiddleware } from '@nestjs/common';

import { FastifyReply, FastifyRequest } from 'fastify';
import {
  InjectLogger,
  LoggedMiddleware,
  ScopedLogger,
} from 'nestlogged-fastify';

import { ConfigService } from './config/config.service';

/**
 * * CORS header
 */
@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  @LoggedMiddleware()
  use(
    _req: FastifyRequest['raw'],
    _res: FastifyReply['raw'],
    _next: () => void,
    @InjectLogger _logger?: ScopedLogger,
  ) {
    if (!_res.hasHeader('Access-Control-Allow-Origin'))
      _res.setHeader(
        'Access-Control-Allow-Origin',
        this.configService.get('FRONTEND_ORIGIN'),
      );
    if (!_res.hasHeader('Access-Control-Allow-Methods'))
      _res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
    _next();
  }
}
