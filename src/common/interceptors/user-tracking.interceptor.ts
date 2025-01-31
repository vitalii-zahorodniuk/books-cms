import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { GraphQLResolveInfo } from 'graphql';

interface GqlContext {
  req: {
    user: {
      id: string;
    };
  };
}

interface BaseEntity {
  id: string;
  createdBy?: unknown;
}

@Injectable()
export class UserTrackingInterceptor implements NestInterceptor {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GqlContext>();
    const info = ctx.getInfo<GraphQLResolveInfo>();

    if (!gqlContext?.req?.user || !info?.returnType) {
      return next.handle();
    }

    const returnType = info.returnType.toString().replace(/[[\]!]/g, '');
    const user = gqlContext.req.user;

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          void this.handleData(data, returnType, user);
        },
      }),
    );
  }

  private async handleData(
    data: unknown,
    returnType: string,
    user: { id: string },
  ): Promise<void> {
    if (!data) return;

    try {
      const items = Array.isArray(data) ? data : [data];
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
      console.error('Error in interceptor:', error);
    }
  }
}
