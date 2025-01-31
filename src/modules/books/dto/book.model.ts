import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Author } from '../../../entities/author.entity';

@ObjectType()
export class Book {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  year: number;

  @Field(() => [Author])
  authors!: Author[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
