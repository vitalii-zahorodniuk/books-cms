import { registerEnumType } from '@nestjs/graphql';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// register graphql enum
registerEnumType(SortOrder, {
  name: 'SortOrder',
});
