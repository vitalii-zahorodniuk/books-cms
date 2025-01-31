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
    private reflector: Reflector,
    private rolesService: RolesService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check if endpoint is available without authorization
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    // get user id from request context
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GqlContext>();
    const userId = gqlContext.req.user?.id;

    if (!userId) {
      return false;
    }

    // get fresh user data with roles from database
    const user = await this.usersService.findOne(userId, {
      relations: ['roles'],
    });

    if (!user?.isActive) {
      return false;
    }

    // allow all actions for admin
    // if (user.roles.some((role) => role.name === UserRole.ADMIN)) {
    //   return true;
    // }

    // check if user has required roles
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (requiredRoles) {
      const hasRole = user.roles.some((role) =>
        requiredRoles.includes(role.name),
      );
      if (!hasRole) return false;
    }

    // check if user's roles have required permissions
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    if (requiredPermissions) {
      for (const permission of requiredPermissions) {
        const hasPermission = await Promise.all(
          user.roles.map((role) =>
            this.rolesService.hasPermission(role.id, permission),
          ),
        );
        if (!hasPermission.some(Boolean)) {
          return false;
        }
      }
    }

    return true;
  }
}
