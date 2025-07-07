import { Injectable } from '@nestjs/common';

import hyperid from 'hyperid';

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

  generate(): string {
    return this.generator();
  }

  decode(id: string): DecodedId {
    return this.generator.decode(id, { urlSafe: true });
  }
}
