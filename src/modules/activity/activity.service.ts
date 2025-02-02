import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { ActivityLog } from './schemas/activity-log.schema';
import { BookReview } from './schemas/book-review.schema';
import { SortOrder } from 'dynamoose/dist/General';

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
    details: Record<string, unknown>,
  ): Promise<ActivityLog> {
    try {
      return await this.activityModel.create({
        userId,
        timestamp: new Date(),
        action,
        details: details ?? {},
      });
    } catch (error) {
      this.logger.error(
        `Failed to log activity: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // creates or updates a book review for a specific user
  async createReview(
    bookId: string,
    userId: string,
    rating: number,
    review?: string,
  ): Promise<BookReview> {
    try {
      const reviewData = {
        bookId,
        userId,
        rating,
        review,
        createdAt: new Date().toISOString(),
      };

      const [existingReview] = await this.reviewModel
        .query('bookId')
        .eq(bookId)
        .where('userId')
        .eq(userId)
        .exec();

      const result = existingReview
        ? await this.reviewModel.update({ ...reviewData, bookId: existingReview.bookId })
        : await this.reviewModel.create(reviewData);

      return result as BookReview;
    } catch (error) {
      this.logger.error(
        `Failed to create/update review: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // retrieves all reviews for a specific book
  async getBookReviews(bookId: string): Promise<BookReview[]> {
    try {
      return await this.reviewModel.query('bookId').eq(bookId).exec();
    } catch (error) {
      this.logger.error(
        `Failed to get book reviews: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // retrieves paginated user activity history
  async getUserActivity(
    userId: string,
    limit = 50,
    lastEvaluatedKey?: Record<string, unknown>,
  ): Promise<{
    items: ActivityLog[];
    lastEvaluatedKey?: Record<string, unknown>;
  }> {
    try {
      const query = this.activityModel
        .query('userId')
        .eq(userId)
        .sort(SortOrder.descending)
        .limit(limit);

      if (lastEvaluatedKey) {
        query.startAt(lastEvaluatedKey);
      }

      const result = await query.exec();

      return {
        items: result,
        lastEvaluatedKey: result.lastKey,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user activity: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // calculates average rating for a book
  async getBookAverageRating(bookId: string): Promise<number> {
    try {
      const reviews = await this.reviewModel.query('bookId').eq(bookId).exec();

      if (!reviews.length) return 0;

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      return Number((sum / reviews.length).toFixed(2));
    } catch (error) {
      this.logger.error(
        `Failed to get average rating: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // retrieves all reviews by a specific user
  async getUserReviews(userId: string): Promise<BookReview[]> {
    try {
      return await this.reviewModel
        .query('userId')
        .using('userReviewsIndex')
        .eq(userId)
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to get user reviews: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
