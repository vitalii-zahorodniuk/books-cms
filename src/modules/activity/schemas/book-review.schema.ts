import { Schema } from 'dynamoose';

// schema for book reviews in dynamodb
export const BookReviewSchema = new Schema(
  {
    bookId: {
      type: String,
      hashKey: true,
    },
    userId: {
      type: String,
      rangeKey: true,
      index: {
        name: 'userReviewsIndex',
        type: 'global',
        rangeKey: 'createdAt',
      },
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
    },
    // use custom date field instead of timestamp
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: false,
    saveUnknown: false,
  },
);

export interface BookReview {
  bookId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}
