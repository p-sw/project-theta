import { HTTPExceptionBase } from '@/error';

export namespace SubmitOAuthSession {
  export interface Query {
    /** OAuth code from URL search params given by OAuth provider. */
    code: string;
  }
  export interface Response {
    /** Session ID will be set in cookie as httpOnly. */
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
