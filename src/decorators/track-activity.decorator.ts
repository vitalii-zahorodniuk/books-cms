export const TrackActivity = (action: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);

        const activityService = this.activityService;

        if (activityService) {
          await activityService.logActivity('system', action, {
            operation: propertyKey,
            timestamp: new Date(),
          });
        }

        return result;
      } catch (error) {
        throw error;
      }
    };

    return descriptor;
  };
};
