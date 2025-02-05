import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { GraphQLResolveInfo, Kind } from 'graphql';
import { Book } from '../../entities/book.entity';
import { Author } from '../../entities/author.entity';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { ActivityService } from '../activity/activity.service';
import { BookFilterInput } from './dto/book-filter.input';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { UserTrackingInterceptor } from '../../common/interceptors/user-tracking.interceptor';
import { EntityManager } from 'typeorm';

// mock all entity modules
jest.mock('../../entities/user.entity', () => ({
  User: jest.fn().mockImplementation((props) => ({
    id: 'user-1',
    email: 'test@example.com',
    isActive: true,
    roles: [],
    ...props,
  })),
}));

jest.mock('../../entities/role.entity', () => ({
  Role: jest.fn().mockImplementation((props) => ({
    id: 'role-1',
    name: 'user',
    permissions: [],
    users: [],
    ...props,
  })),
}));

jest.mock('../../entities/permission.entity', () => ({
  Permission: jest.fn().mockImplementation((props) => ({
    id: 'permission-1',
    name: 'read',
    roles: [],
    ...props,
  })),
}));

jest.mock('../../entities/book.entity', () => ({
  Book: jest.fn().mockImplementation((props) => ({
    id: 'book-1',
    title: 'Test Book',
    description: 'Test Description',
    year: 2024,
    authors: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: undefined,
    updatedBy: undefined,
    ...props,
  })),
}));

jest.mock('../../entities/author.entity', () => ({
  Author: jest.fn().mockImplementation((props) => ({
    id: 'author-1',
    name: 'Test Author',
    books: [],
    ...props,
  })),
}));

interface MockBook {
  id: string;
  title: string;
  description?: string;
  year: number;
  authors: any[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: any;
  updatedBy?: any;
}

// helper to create mock graphql info
const createMockInfo = (fields: string[]): Partial<GraphQLResolveInfo> => ({
  fieldNodes: [
    {
      selectionSet: {
        selections: fields.map((field) => ({
          kind: Kind.FIELD,
          name: { value: field, kind: Kind.NAME },
        })),
      },
    },
  ] as any,
});

// helper to create mock book
const createMockBook = (override: Partial<MockBook> = {}): MockBook => ({
  id: 'test-id',
  title: 'Test Book',
  description: 'Test Description',
  year: 2024,
  authors: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: undefined,
  updatedBy: undefined,
  ...override,
});

describe('BooksResolver', () => {
  let resolver: BooksResolver;
  let booksService: jest.Mocked<BooksService>;
  let activityService: jest.Mocked<ActivityService>;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(jest.fn());
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksResolver,
        {
          provide: BooksService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ActivityService,
          useValue: {
            logActivity: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              update: jest.fn().mockReturnThis(),
              set: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              execute: jest.fn().mockResolvedValue(true),
            })),
          },
        },
      ],
    })
      .overrideInterceptor(UserTrackingInterceptor)
      .useValue({
        intercept: jest
          .fn()
          .mockImplementation((context, next) => next.handle()),
      })
      .compile();

    resolver = module.get<BooksResolver>(BooksResolver);
    booksService = module.get(BooksService);
    activityService = module.get(ActivityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('books query', () => {
    const mockContext = { req: { user: { id: 'user-1' } } };
    const paginationArgs = { skip: 0, take: 10 };

    it('should return paginated books with filters', async () => {
      const mockBooks = [createMockBook(), createMockBook()];
      const filter: BookFilterInput = { title: 'test' };
      const mockInfo = createMockInfo(['title', 'authors']);
      booksService.findAll.mockResolvedValue(mockBooks as any);

      const result = await resolver.books(
        mockContext,
        paginationArgs,
        filter,
        undefined,
        mockInfo as GraphQLResolveInfo,
      );

      expect(result).toEqual(mockBooks);
      expect(booksService.findAll).toHaveBeenCalledWith(
        paginationArgs,
        filter,
        undefined,
        ['authors'],
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      booksService.findAll.mockRejectedValue(error);

      await expect(resolver.books(mockContext, paginationArgs)).rejects.toThrow(
        error,
      );
    });
  });

  describe('book query', () => {
    const bookId = 'test-id';
    const mockContext = { req: { user: { id: 'user-1' } } };

    it('should return a single book by id', async () => {
      const mockBook = createMockBook();
      booksService.findOne.mockResolvedValue(mockBook as Book);

      const result = await resolver.book(bookId, mockContext);

      expect(result).toEqual(mockBook);
      expect(booksService.findOne).toHaveBeenCalledWith(bookId);
    });

    it('should throw NotFoundException for non-existent book', async () => {
      booksService.findOne.mockRejectedValue(
        new NotFoundException('Book not found'),
      );

      await expect(resolver.book(bookId, mockContext)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('mutations', () => {
    const mockContext = { req: { user: { id: 'user-1' } } };

    describe('createBook', () => {
      it('should create a new book', async () => {
        const input: CreateBookInput = {
          title: 'New Book',
          description: 'Description',
          year: 2024,
          authorIds: ['author-1'],
        };
        const mockBook = createMockBook(input);
        booksService.create.mockResolvedValue(mockBook as Book);

        const result = await resolver.createBook(input, mockContext);

        expect(result).toEqual(mockBook);
        expect(booksService.create).toHaveBeenCalledWith(input);
      });
    });

    describe('updateBook', () => {
      it('should update existing book', async () => {
        const bookId = 'test-id';
        const input: UpdateBookInput = {
          title: 'Updated Title',
        };
        const mockBook = createMockBook(input);
        booksService.update.mockResolvedValue(mockBook as Book);

        const result = await resolver.updateBook(bookId, input, mockContext);

        expect(result).toEqual(mockBook);
        expect(booksService.update).toHaveBeenCalledWith(bookId, input);
      });
    });

    describe('deleteBook', () => {
      it('should delete book and return true', async () => {
        const bookId = 'test-id';
        booksService.delete.mockResolvedValue(true);

        const result = await resolver.deleteBook(bookId, mockContext);

        expect(result).toBe(true);
        expect(booksService.delete).toHaveBeenCalledWith(bookId);
      });
    });
  });

  describe('field resolvers', () => {
    describe('authors', () => {
      it('should resolve book authors', async () => {
        const mockAuthors = [
          { id: 'author-1', name: 'Author 1' } as Author,
          { id: 'author-2', name: 'Author 2' } as Author,
        ];
        const mockBook = createMockBook({ authors: mockAuthors });

        const result = await resolver.getAuthors(mockBook as Book, {});

        expect(result).toEqual(mockAuthors);
      });

      it('should return empty array when no authors', async () => {
        const mockBook = createMockBook({ authors: undefined });

        const result = await resolver.getAuthors(mockBook as Book, {});

        expect(result).toEqual([]);
      });
    });
  });
});
