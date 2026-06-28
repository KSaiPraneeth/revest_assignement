import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3004', 10),
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'revest',
  password: process.env.DB_PASSWORD ?? 'revest_secret',
  database: process.env.DB_NAME ?? 'auth_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'revest_jwt_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
}));
