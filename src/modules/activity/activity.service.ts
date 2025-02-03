import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { ActivityLog } from './schemas/activity-log.schema';
import { BookReview } from './schemas/book-review.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectModel('ActivityLog')
    private readonly activityModel: Model<ActivityLog, string, string>,
    @InjectModel('BookReview')
    private readonly reviewModel: Model<BookReview, string, string>,
  ) {}

  // logs user activity with provided details
  async logActivity(
    userId: string,
    action: string,
    details: string,
  ): Promise<ActivityLog> {
    try {
      return (await this.activityModel.create({
        entityId: randomUUID(),
        userId,
        action,
        details,
        timestamp: new Date().toISOString(),
      })) as ActivityLog;
    } catch (error) {
      this.logger.error(
        `Failed to log activity: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
