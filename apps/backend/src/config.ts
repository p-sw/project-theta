import typia from 'typia';

export interface Config {
  BACKEND_HOST: string;
  BACKEND_PORT: number;

  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;

  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_REDIRECT_URI: string;
}

export default function envLoader() {
  return typia.assert<Config>(process.env);
}
