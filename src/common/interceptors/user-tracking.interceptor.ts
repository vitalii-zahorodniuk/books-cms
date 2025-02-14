import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { GraphQLResolveInfo } from 'graphql';

// represents user context in graphql requests
interface GqlContext {
  req: {
    user: {
      id: string;
    };
  };
}

// base structure for trackable entities
interface BaseEntity {
  id: string;
  createdBy?: unknown;
}

@Injectable()
export class UserTrackingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserTrackingInterceptor.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // handles entity tracking across graphql operations
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GqlContext>();
    const info = ctx.getInfo<GraphQLResolveInfo>();

    // skip if context is insufficient
    if (!gqlContext?.req?.user || !info?.returnType) {
      return next.handle();
    }

    // clean up type name for db operations
    const returnType = info.returnType.toString().replace(/[[\]!]/g, '');
    const user = gqlContext.req.user;

    // track changes after successful execution
    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          void this.handleData(data, returnType, user);
        },
      }),
    );
  }

  // updates entity tracking metadata
  private async handleData(
    data: unknown,
    returnType: string,
    user: { id: string },
  ): Promise<void> {
    if (!data) return;

    try {
      // normalize input to array
      const items = Array.isArray(data) ? data : [data];

      // extract valid entity ids
      const ids = items
        .filter(
          (item: unknown): item is BaseEntity =>
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            typeof item.id === 'string',
        )
        .map((item: BaseEntity) => item.id);

      if (ids.length > 0) {
        // bulk update tracking fields
        const query = this.entityManager
          .createQueryBuilder()
          .update(returnType)
          .set({
            updatedById: user.id,
            createdById: () =>
              'CASE WHEN "created_by_id" IS NULL THEN :userId ELSE "created_by_id" END',
          })
          .where('id IN (:...ids)', { ids, userId: user.id });

        await query.execute();
      }
    } catch (error) {
      this.logger.error(
        `failed to track user data: ${error.message}`,
        error.stack,
      );
    }
  }
}
