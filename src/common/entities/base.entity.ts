import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../entities/user.entity';

// base entity model to be extended by all entities with common fields
@ObjectType({ isAbstract: true })
export abstract class BaseEntityModel {
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById?: string;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById?: string;
}
