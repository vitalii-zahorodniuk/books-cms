import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { ActivityLog } from './schemas/activity-log.schema';
import { BookReview } from './schemas/book-review.schema';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel('ActivityLog')
    private activityModel: Model<ActivityLog, string, string>,
    @InjectModel('BookReview')
    private reviewModel: Model<BookReview, string, string>,
  ) {}

  async logActivity(
    userId: string,
    action: string,
    details: any,
  ): Promise<ActivityLog> {
    return this.activityModel.create({
      userId,
      timestamp: new Date(),
      action,
      details,
    });
  }

  async createReview(
    bookId: string,
    userId: string,
    rating: number,
    review?: string,
  ): Promise<BookReview> {
    return this.reviewModel.create({
      bookId,
      userId,
      rating,
      review,
      createdAt: new Date(),
    });
  }

  async getBookReviews(bookId: string): Promise<BookReview[]> {
    return this.reviewModel.query('bookId').eq(bookId).exec();
  }

  async getUserActivity(userId: string): Promise<ActivityLog[]> {
    return this.activityModel.query('userId').eq(userId).exec();
  }
}
