import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ActivityLogSchema } from './schemas/activity-log.schema';
import { BookReviewSchema } from './schemas/book-review.schema';
import { ActivityService } from './activity.service';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'ActivityLog',
        schema: ActivityLogSchema,
      },
      {
        name: 'BookReview',
        schema: BookReviewSchema,
      },
    ]),
  ],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
