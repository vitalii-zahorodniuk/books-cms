import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BaseEntityModel } from '../common/entities/base.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@ObjectType()
@Entity('roles')
export class Role extends BaseEntityModel {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [Permission])
  @ManyToMany(
    () => Permission,
    (permission: Permission): Role[] => permission.roles,
  )
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];

  @Field(() => [User])
  @ManyToMany(() => User, (user: User): Role[] => user.roles)
  users: User[];
}
