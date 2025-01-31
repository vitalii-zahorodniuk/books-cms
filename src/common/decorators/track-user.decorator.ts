import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { UserTrackingInterceptor } from '../interceptors/user-tracking.interceptor';

// merge tracking decorators into one
export const TrackUser = () =>
  applyDecorators(UseInterceptors(UserTrackingInterceptor));
