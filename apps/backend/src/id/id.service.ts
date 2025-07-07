import { Injectable } from '@nestjs/common';

import * as hyperid from 'hyperid';
import { LoggedFunction, Returns } from 'nestlogged-fastify';

export interface DecodedId {
  uuid: string;
  count: number;
}

@Injectable()
export class IdService {
  private readonly generator: hyperid.Instance;

  constructor() {
    this.generator = hyperid({
      fixedLength: true,
      urlSafe: true,
      maxInt: 100,
    });
  }

  @LoggedFunction({ callLogLevel: 'skip', returnLogLevel: 'debug' })
  @Returns()
  generate(): string {
    return this.generator();
  }

  @LoggedFunction({ callLogLevel: 'skip', returnLogLevel: 'debug' })
  @Returns({ uuid: 'uuid', count: 'count' })
  decode(id: string): DecodedId {
    return this.generator.decode(id, { urlSafe: true });
  }
}
