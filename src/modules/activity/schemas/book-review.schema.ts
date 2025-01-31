import { Schema } from 'dynamoose';

export const BookReviewSchema = new Schema({
  bookId: {
    type: String,
    hashKey: true,
  },
  userId: {
    type: String,
    rangeKey: true,
  },
  rating: Number,
  review: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export interface BookReview {
  bookId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: Date;
}
