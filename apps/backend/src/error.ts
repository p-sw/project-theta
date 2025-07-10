import { HttpStatus, HttpException as _HttpException } from '@nestjs/common';

export type PossiblyError<E extends Record<string, unknown>, S> =
  | {
      [K in keyof E]: {
        ok: false;
        code: K;
        error: E[K];
      };
    }[keyof E]
  | {
      ok: true;
      data: S;
    };

export type NeverError<
  P extends PossiblyError<Record<string, unknown>, unknown>,
> = P extends {
  ok: false;
}
  ? never
  : P;

export type NeverSuccess<
  P extends PossiblyError<Record<string, unknown>, unknown>,
> = P extends {
  ok: true;
}
  ? never
  : P;

export type ErrorFunc<
  P extends
    | ((...args: unknown[]) => PossiblyError<Record<string, unknown>, unknown>)
    | ((
        ...args: unknown[]
      ) => Promise<PossiblyError<Record<string, unknown>, unknown>>),
> = P extends (...args: unknown[]) => infer R
  ? R extends Promise<infer R2>
    ? R2 extends PossiblyError<Record<string, unknown>, unknown>
      ? NeverSuccess<R2>
      : never
    : R extends PossiblyError<Record<string, unknown>, unknown>
      ? NeverSuccess<R>
      : never
  : never;

export type SuccessFunc<
  P extends
    | ((...args: unknown[]) => PossiblyError<Record<string, unknown>, unknown>)
    | ((
        ...args: unknown[]
      ) => Promise<PossiblyError<Record<string, unknown>, unknown>>),
> = P extends (...args: unknown[]) => infer R
  ? R extends Promise<infer R2>
    ? R2 extends PossiblyError<Record<string, unknown>, unknown>
      ? NeverError<R2>
      : never
    : R extends PossiblyError<Record<string, unknown>, unknown>
      ? NeverError<R>
      : never
  : never;

type InferErrorRecordUnion<
  P extends PossiblyError<Record<string, unknown>, unknown>,
> = P extends {
  ok: false;
  code: infer C;
  error: infer D;
}
  ? C extends keyof any
    ? { [K in C]: D }
    : never
  : never;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

type InferSuccess<P extends PossiblyError<Record<string, unknown>, unknown>> =
  P extends {
    ok: true;
    data: infer D;
  }
    ? D
    : never;

export function error<
  P extends PossiblyError<Record<string, unknown>, unknown>,
  E extends Record<string, unknown> = UnionToIntersection<
    InferErrorRecordUnion<P>
  > extends Record<string, unknown>
    ? UnionToIntersection<InferErrorRecordUnion<P>>
    : Record<string, never>,
>(
  ...args: {
    [K in keyof E]: E[K] extends void | undefined
      ? [code: K, error?: E[K]]
      : [code: K, error: E[K]];
  }[keyof E]
): PossiblyError<E, never> {
  const [code, error] = args;
  return {
    ok: false,
    code,
    error,
  } as PossiblyError<E, never>;
}

export function ok<
  P extends PossiblyError<Record<string, unknown>, unknown>,
  S = InferSuccess<P>,
>(data: S): PossiblyError<never, S> {
  return {
    ok: true,
    data,
  };
}

export interface HTTPExceptionBase<C extends string, E = void> {
  code: C;
  error: E;
}

export class HTTPException<
  E extends HTTPExceptionBase<string, unknown>,
> extends _HttpException {
  constructor(code: E['code'], error: E['error'], status: number) {
    super(HTTPException.createBody({ code, error }), status);
  }
}

export class BadRequestException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.UNAUTHORIZED);
  }
}

export class NotFoundException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.NOT_FOUND);
  }
}

export class ForbiddenException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.FORBIDDEN);
  }
}

export class NotAcceptableException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.NOT_ACCEPTABLE);
  }
}

export class RequestTimeoutException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.REQUEST_TIMEOUT);
  }
}

export class ConflictException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.CONFLICT);
  }
}

export class GoneException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.GONE);
  }
}

export class HttpVersionNotSupportedException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.HTTP_VERSION_NOT_SUPPORTED);
  }
}

export class PayloadTooLargeException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.PAYLOAD_TOO_LARGE);
  }
}

export class UnsupportedMediaTypeException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

export class UnprocessableEntityException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class InternalServerErrorException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class NotImplementedException<
  E extends HTTPExceptionBase<string, unknown>,
> extends HTTPException<E> {
  constructor(code: E['code'], error: E['error']) {
    super(code, error, HttpStatus.NOT_IMPLEMENTED);
  }
}
