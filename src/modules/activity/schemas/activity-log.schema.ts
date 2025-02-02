import { Schema } from 'dynamoose';

export const ActivityLogSchema = new Schema(
  {
    userId: {
      type: String,
      hashKey: true,
    },
    timestamp: {
      type: Date,
      rangeKey: true,
      default: Date.now,
    },
    action: {
      type: String,
      required: true,
      index: {
        name: 'actionIndex',
        type: 'global',
        rangeKey: 'timestamp',
      },
    },
    details: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export interface ActivityLog {
  userId: string;
  timestamp: Date;
  action: string;
  details: any;
}
