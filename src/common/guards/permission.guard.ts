import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/auth.decorators';
import { RolesService } from '../../modules/roles/roles.service';
import { UsersService } from '../../modules/users/users.service';

// type for graphql context with user information
interface GqlContext {
  req: {
    user?: {
      id: string;
    };
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
  ) {}

  // validates user access based on roles and permissions
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // check for public route marker
      const isPublic = this.reflector.get<boolean>(
        'isPublic',
        context.getHandler(),
      );
      if (isPublic) {
        return true;
      }

      // extract user from graphql context
      const ctx = GqlExecutionContext.create(context);
      const gqlContext = ctx.getContext<GqlContext>();
      const userId = gqlContext.req.user?.id;

      if (!userId) {
        this.logger.debug('user not authenticated');
        return false;
      }

      // fetch user with roles for permission check
      const user = await this.usersService.findOne(userId, {
        relations: ['roles'],
      });

      if (!user?.isActive) {
        this.logger.debug(`user ${userId} is inactive`);
        return false;
      }

      // validate role-based access
      const requiredRoles = this.reflector.get<string[]>(
        ROLES_KEY,
        context.getHandler(),
      );
      if (requiredRoles?.length) {
        const hasRole = user.roles.some((role) =>
          requiredRoles.includes(role.name),
        );
        if (!hasRole) {
          this.logger.debug(
            `missing required roles: ${requiredRoles.join(', ')}`,
          );
          return false;
        }
      }

      // validate permission-based access
      const requiredPermissions = this.reflector.get<string[]>(
        PERMISSIONS_KEY,
        context.getHandler(),
      );
      if (requiredPermissions?.length) {
        const permissionChecks = await Promise.all(
          requiredPermissions.flatMap((permission) =>
            user.roles.map((role) =>
              this.rolesService.hasPermission(role.id, permission),
            ),
          ),
        );

        if (!permissionChecks.some(Boolean)) {
          this.logger.debug(
            `missing required permissions: ${requiredPermissions.join(', ')}`,
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('permission validation failed', {
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }
}
