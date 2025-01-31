import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async hasPermission(
    roleId: string,
    permissionName: string,
  ): Promise<boolean> {
    const cacheKey = `role_permissions_${roleId}`;
    let permissions = await this.cacheManager.get<string[]>(cacheKey);
    if (!permissions) {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissions'],
      });

      if (!role) {
        return false;
      }

      permissions = role.permissions.map((p) => p.name);
      await this.cacheManager.set(cacheKey, permissions);
    }

    return permissions.includes(permissionName);
  }
}
