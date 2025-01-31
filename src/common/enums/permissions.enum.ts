export enum Permission {
  // BOOKS
  LIST_BOOKS = 'books:list',
  READ_BOOK = 'books:read',
  CREATE_BOOK = 'books:create',
  UPDATE_BOOK = 'books:update',
  DELETE_BOOK = 'books:delete',
  // it can be extended with other permissions i.e. authors, users, etc.
}
