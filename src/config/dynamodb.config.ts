import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';

// factory function for dynamodb configuration
// handles both local development and production environments
const getDynamoConfig = (configService: ConfigService) => ({
  aws: {
    region: configService.get<string>('AWS_REGION'),
    accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
  },
  // enables local dynamodb for development
  local: configService.get('NODE_ENV') === 'development',
  // allows custom endpoint for local development or testing
  endpoint: configService.get<string>('DYNAMODB_ENDPOINT'),
  // auto-creates tables in development mode
  create: configService.get('NODE_ENV') === 'development',
});

// exports configuration for both module imports and async factory
export const DynamoDBConfig = {
  imports: [
    DynamooseModule.forRootAsync({
      useFactory: getDynamoConfig,
      inject: [ConfigService],
    }),
  ],
  useFactory: getDynamoConfig,
} as const;
