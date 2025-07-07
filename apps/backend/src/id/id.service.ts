import { Injectable } from '@nestjs/common';
import { init } from '@paralleldrive/cuid2';

import * as _hyperid from 'hyperid';
import { LoggedFunction, Returns } from 'nestlogged-fastify';

export interface DecodedId {
  uuid: string;
  count: number;
}

@Injectable()
export class IdService {
  private readonly hyperid: _hyperid.Instance;
  private readonly cuid2: ReturnType<typeof init>;

  constructor() {
    this.hyperid = _hyperid({
      fixedLength: true,
      urlSafe: true,
      maxInt: 100,
    });
    this.cuid2 = init({
      random: () => crypto.getRandomValues(new Uint8Array(16))[0],
    });
  }

  @LoggedFunction({ callLogLevel: 'skip', returnLogLevel: 'debug' })
  @Returns('hyperid')
  generate(): string {
    return this.hyperid();
  }

  @LoggedFunction({ callLogLevel: 'skip', returnLogLevel: 'debug' })
  @Returns({ uuid: 'uuid', count: 'count' })
  decode(id: string): DecodedId {
    return this.hyperid.decode(id, { urlSafe: true });
  }

  @LoggedFunction({ callLogLevel: 'skip', returnLogLevel: 'debug' })
  @Returns('crypto_id')
  cryptoGenerate(): string {
    return this.cuid2();
  }
}
