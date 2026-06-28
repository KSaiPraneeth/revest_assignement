import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'revest',
  password: process.env.DB_PASSWORD ?? 'revest_secret',
  database: process.env.DB_NAME ?? 'product_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'revest_jwt_secret_change_in_production',
}));

export const authServiceConfig = registerAs('authService', () => ({
  baseUrl: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3004',
}));
