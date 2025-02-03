import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

// dynamodb configuration
const getDynamoConfig = (configService: ConfigService) => {
  const logger = new Logger('DynamoDB');
  const isDevMode = configService.get('NODE_ENV') === 'development';

  return {
    aws: {
      region: configService.get<string>('AWS_REGION'),
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      endpoint: configService.get<string>('DYNAMODB_ENDPOINT'),
      logger: isDevMode
        ? {
            log: (message: string) => logger.debug(message),
            warn: (message: string) => logger.warn(message),
            error: (message: string) => logger.error(message),
          }
        : undefined,
    },
    // enables local dynamodb for development
    local: isDevMode,
    // auto-creates tables in development mode
    create: isDevMode,
  };
};

// exports configuration for both module imports and async factory
export const DynamoDBConfig = {
  imports: [
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDynamoConfig,
    }),
  ],
  useFactory: getDynamoConfig,
} as const;
