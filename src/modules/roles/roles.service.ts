import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  // checks if role has specific permission with cache support
  async hasPermission(
    roleId: string,
    permissionName: string,
  ): Promise<boolean> {
    try {
      // try to get permissions from cache first
      const cacheKey = `role_permissions_${roleId}`;
      let permissions = await this.cacheManager.get<string[]>(cacheKey);

      // fetch from db if cache miss
      if (!permissions) {
        this.logger.debug(`cache miss for role ${roleId}, fetching from db`);

        const role = await this.roleRepository.findOne({
          where: { id: roleId },
          relations: ['permissions'],
        });

        if (!role) {
          this.logger.warn(`role ${roleId} not found`);
          return false;
        }

        // extract permission names and cache them
        permissions = role.permissions.map((p) => p.name);
        await this.cacheManager.set(cacheKey, permissions);
        this.logger.debug(`cached permissions for role ${roleId}`);
      }

      return permissions.includes(permissionName);
    } catch (error) {
      this.logger.error(
        `failed to check permission ${permissionName} for role ${roleId}`,
        error.stack,
      );
      return false;
    }
  }
}
