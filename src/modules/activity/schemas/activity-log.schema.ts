import { Schema } from 'dynamoose';

export const ActivityLogSchema = new Schema({
  userId: {
    type: String,
    hashKey: true,
  },
  timestamp: {
    type: Date,
    rangeKey: true,
  },
  action: String,
  details: Object,
});

export interface ActivityLog {
  userId: string;
  timestamp: Date;
  action: string;
  details: any;
}
