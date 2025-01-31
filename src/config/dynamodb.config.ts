import { ConfigService } from '@nestjs/config';

export const getDynamoDBConfig = (configService: ConfigService) => ({
  aws: {
    region: configService.get('DYNAMODB_REGION', 'eu-west-1'),
    accessKeyId: configService.get('DYNAMODB_ACCESS_KEY_ID', ''),
    secretAccessKey: configService.get('DYNAMODB_SECRET_ACCESS_KEY', ''),
    endpoint: configService.get('DYNAMODB_ENDPOINT', 'http://localhost:8000'),
  },
});
