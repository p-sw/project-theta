import { HTTPExceptionBase } from '@/error';

export namespace SubmitOAuthSession {
  export interface Query {
    code: string;
  }
  export interface Response {
    session: string;
  }
  export type InvalidOAuthCodeException =
    HTTPExceptionBase<'invalid_oauth_code'>;
  export type UserInfoFetchFailedException = HTTPExceptionBase<
    'user_info_fetch_failed',
    {
      httpStatus: number;
    }
  >;
  export type IdNotFoundException = HTTPExceptionBase<
    'id_not_found',
    {
      responseJson: Record<string, unknown>;
    }
  >;
}
