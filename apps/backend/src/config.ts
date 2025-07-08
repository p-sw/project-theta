import typia from 'typia';

type Numeric = typia.tags.Pattern<'^[0-9]+$'>;

export interface TConfig {
  BACKEND_HOST: string;
  BACKEND_PORT: string & Numeric;

  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;

  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_REDIRECT_URI: string;
}

type TRANSFORM_KEY = 'BACKEND_PORT';
export interface Config extends Omit<TConfig, TRANSFORM_KEY> {
  BACKEND_PORT: number;
}

function transformer(config: TConfig): Config {
  return {
    ...config,
    BACKEND_PORT: Number(config.BACKEND_PORT),
  };
}

export default function envLoader() {
  return transformer(typia.assert<TConfig>(process.env));
}
