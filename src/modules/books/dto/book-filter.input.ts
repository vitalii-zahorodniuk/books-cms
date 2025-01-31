import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../../../common/dto/sort.enum';

@InputType()
export class BookFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  yearFrom?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  yearTo?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorId?: string;
}

@InputType()
export class BookSortInput {
  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  title?: SortOrder;

  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  year?: SortOrder;

  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  createdAt?: SortOrder;
}
