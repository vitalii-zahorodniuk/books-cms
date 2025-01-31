import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  // get request and response objects from context
  getRequestResponse(context: ExecutionContext) {
    // handle http requests
    if (context.getType() === 'http') {
      return {
        req: context.switchToHttp().getRequest(),
        res: context.switchToHttp().getResponse(),
      };
    }

    // handle graphql requests
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.req.res };
  }

  // generate a unique key for throttling based on IP only
  protected generateKey(context: ExecutionContext, suffix: string) {
    const { req } = this.getRequestResponse(context);
    // use common key for all requests from the same IP
    return `throttler_${req.ip}`;
  }
}
