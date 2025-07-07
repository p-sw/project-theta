import typia from 'typia';

export interface Config {
  BACKEND_HOST: string;
  BACKEND_PORT: number;
}

export default function envLoader() {
  return typia.assert<Config>(process.env);
}
