import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ActivityService } from './activity.service';
import { BookReviewSchema } from './schemas/book-review.schema';
import { ActivityLogSchema } from './schemas/activity-log.schema';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'BookReview',
        schema: BookReviewSchema,
        options: {
          tableName: 'book_reviews',
        },
      },
      {
        name: 'ActivityLog',
        schema: ActivityLogSchema,
        options: {
          tableName: 'activity_logs',
        },
      },
    ]),
  ],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
