import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

// roles decorator - can be deleted if it won't be used
// export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// permissions decorator
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// allow request be available for anyone (without auth)
export const Public = () => SetMetadata('isPublic', true);
