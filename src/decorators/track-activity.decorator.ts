import { Logger } from '@nestjs/common';

// tracks method execution and logs activity using the activity service
export const TrackActivity = (action: string) => {
  const logger = new Logger('TrackActivity');

  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // execute the original method first to avoid logging failed operations
        const result = await originalMethod.apply(this, args);

        // ensure activity service is properly injected
        const activityService = this.activityService;
        if (!activityService) {
          logger.warn(
            `activity service not found in ${target.constructor.name}, skipping activity tracking`,
          );
          return result;
        }

        // log the activity with method context
        await activityService.logActivity('system', action, {
          method: propertyKey,
          timestamp: new Date(),
          status: 'success',
        });

        return result;
      } catch (error) {
        logger.error(
          `failed to execute ${propertyKey}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    };

    return descriptor;
  };
};
