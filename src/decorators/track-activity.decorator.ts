import { Logger } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';

// describes what we track in activity logs
interface ActivityDetails {
  method: string;
  timestamp: string;
  status: 'success' | 'error';
  operation: string;
  input: Record<string, any>;
  request: {
    method?: string;
    url?: string;
    ip?: string;
    userAgent?: string;
  };
}

// decorator factory that takes action name as parameter
export const TrackActivity = (action: string) => {
  // create logger instance for this decorator
  const logger = new Logger('TrackActivity');

  // return actual decorator function
  return (
    target: any,
    propertyKey: string, 
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    // store original method to call it later
    const originalMethod = descriptor.value;

    // replace original method with wrapped one
    descriptor.value = async function (
      // args type matches graphql resolver signature
      ...args: [
        any, // root
        Record<string, any>, // args
        { context: any; info: GraphQLResolveInfo }, // context with graphql info
      ]
    ) {
      try {
        // call original method first and wait for result
        const result = await originalMethod.apply(this, args);

        // check if activity service is available in resolver
        const activityService = this.activityService;
        if (!activityService) {
          logger.warn(
            `can't track activity: no service in ${target.constructor.name}`,
          );
          return result;
        }

        // extract request data from graphql context
        const gqlContext = args[2];
        const info = gqlContext?.info;
        const context = gqlContext?.context || gqlContext;
        const request = context?.req;
        
        // get user id from request or context, fallback to system
        const userId = request?.user?.id || context?.user?.id || 'system';

        // prepare activity details for logging
        const details = {
          method: propertyKey,
          timestamp: new Date().toISOString(),
          status: 'success',
          operation: info?.operation?.operation?.toString() || 'unknown',
          input: {}, // TODO: add input
          request: {
            method: request?.method || context?.request?.method,
            url: request?.originalUrl || request?.url || context?.request?.url,
            ip: request?.ip || context?.request?.ip,
            userAgent: request?.headers?.['user-agent'],
          },
        };

        // save activity log to database
        await activityService.logActivity(
          userId,
          action,
          JSON.stringify(details),
        );

        return result;
      } catch (error: any) {
        // try to log error if activity service exists
        const activityService = this.activityService;
        if (activityService) {
          const gqlContext = args[2];
          const context = gqlContext?.context || gqlContext;
          const request = context?.req;
          const userId = request?.user?.id || context?.user?.id || 'system';

          logger.debug('got error, saving details:', error.message);

          // prepare error details for logging
          const errorDetails = {
            method: propertyKey,
            timestamp: new Date().toISOString(),
            status: 'error',
            operation: 'unknown',
            input: {}, // TODO: add input
            error: error instanceof Error ? error.message : 'Unknown error',
          };

          // save error activity to database
          await activityService.logActivity(
            userId,
            action,
            JSON.stringify(errorDetails),
          );
        }

        // log error and rethrow
        logger.error(
          `method ${propertyKey} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    };

    return descriptor;
  };
};
