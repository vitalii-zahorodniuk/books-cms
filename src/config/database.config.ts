import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProd = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_NAME', 'books_cms'),
    autoLoadEntities: true, // automatically load all entities

    // safe settings
    synchronize: false, // always use migrations
    logging: ['error'], // log errors only

    // connection pool
    poolSize: isProd ? 50 : 20,
    connectTimeoutMS: 10000,

    // ssl for production
    ssl: isProd ? { rejectUnauthorized: true } : false,

    // retry strategy
    retryAttempts: 3,
    retryDelay: 3000,
  };
};
