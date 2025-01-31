import { Field, InputType } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  year: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsUUID('4', { each: true })
  authorIds?: string[];
}
