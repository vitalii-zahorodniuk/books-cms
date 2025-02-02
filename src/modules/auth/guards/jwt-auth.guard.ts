import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // extract request from graphql context for passport
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  // handle jwt validation with public route support
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const isPublic = Reflect.getMetadata('isPublic', ctx.getHandler());

    // skip auth for public routes
    if (isPublic) {
      return true;
    }

    // delegate to passport jwt validation
    return super.canActivate(context);
  }
}
