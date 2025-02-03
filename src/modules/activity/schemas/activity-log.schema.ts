import { Schema } from 'dynamoose';

export const ActivityLogSchema = new Schema(
  {
    entityId: {
      type: String,
      hashKey: true,
    },
    timestamp: {
      type: String,
      rangeKey: true,
      default: () => new Date().toISOString(),
    },
    action: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    details: {
      type: String,
    },
  },
  {
    saveUnknown: ['details.**'],
  },
);

export interface ActivityLog {
  entityId: string;
  timestamp: string;
  action: string;
  userId: string;
  details: string;
}
