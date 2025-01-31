import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role } from './role.entity';
import { BaseEntityModel } from '../common/entities/base.entity';

@ObjectType()
@Entity('permissions')
export class Permission extends BaseEntityModel {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [Role])
  @ManyToMany(() => Role, (role: Role): Permission[] => role.permissions)
  roles: Role[];
}
