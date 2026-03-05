export type RedisConfig = {
  enabled: boolean;
  host: string;
  port: number;
  password?: string;
  db: number;
};
