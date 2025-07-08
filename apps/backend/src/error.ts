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
