import {
  Args,
  Context,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Injectable, Logger } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book as BookModel } from './dto/book.model';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { BookFilterInput, BookSortInput } from './dto/book-filter.input';
import { Permission } from '../../common/enums/permissions.enum';
import { Permissions } from '../../common/decorators/auth.decorators';
import { Author } from '../../entities/author.entity';
import { TrackUser } from '../../common/decorators/track-user.decorator';
import { GraphQLResolveInfo } from 'graphql';
import { TrackActivity } from 'src/decorators/track-activity.decorator';
import { ActivityService } from '../activity/activity.service';

@Resolver(() => BookModel)
@Injectable()
export class BooksResolver {
  private readonly logger = new Logger(BooksResolver.name);

  constructor(
    private readonly booksService: BooksService,
    private readonly activityService: ActivityService,
  ) {}

  // handles paginated book queries with filters
  @Permissions(Permission.LIST_BOOKS)
  @Query(() => [BookModel])
  @TrackActivity('view_books')
  async books(
    @Context() context: any,
    @Args() paginationArgs: PaginationArgs,
    @Args('filter', { nullable: true }) filter?: BookFilterInput,
    @Args('sort', { nullable: true }) sort?: BookSortInput,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<BookModel[]> {
    try {
      const relations: string[] = [];
      if (info && this.hasField(info, 'authors')) {
        relations.push('authors');
        this.logger.debug('including authors in book query');
      }

      const books = await this.booksService.findAll(
        paginationArgs,
        filter,
        sort,
        relations,
      );
      this.logger.debug(`retrieved ${books.length} books`);
      return books;
    } catch (error) {
      this.logger.error('failed to fetch books', error.stack);
      throw error;
    }
  }

  // fetches single book by id
  @Permissions(Permission.READ_BOOK)
  @Query(() => BookModel)
  @TrackActivity('view_book')
  async book(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<BookModel> {
    try {
      const book = await this.booksService.findOne(id);
      this.logger.debug(`retrieved book ${id}`);
      return book;
    } catch (error) {
      this.logger.error(`failed to fetch book ${id}`, error.stack);
      throw error;
    }
  }

  // handles book creation
  @Permissions(Permission.CREATE_BOOK)
  @TrackUser()
  @Mutation(() => BookModel)
  @TrackActivity('create_book')
  async createBook(
    @Args('createBookInput') createBookInput: CreateBookInput,
    @Context() context: any,
  ): Promise<BookModel> {
    try {
      const book = await this.booksService.create(createBookInput);
      this.logger.debug(`created book ${book.id}`);
      return book;
    } catch (error) {
      this.logger.error('failed to create book', error.stack);
      throw error;
    }
  }

  // handles book updates
  @Permissions(Permission.UPDATE_BOOK)
  @TrackUser()
  @Mutation(() => BookModel)
  @TrackActivity('update_book')
  async updateBook(
    @Args('id') id: string,
    @Args('input') input: UpdateBookInput,
    @Context() context: any,
  ): Promise<BookModel> {
    try {
      const book = await this.booksService.update(id, input);
      this.logger.debug(`updated book ${id}`);
      return book;
    } catch (error) {
      this.logger.error(`failed to update book ${id}`, error.stack);
      throw error;
    }
  }

  // handles book deletion
  @Permissions(Permission.DELETE_BOOK)
  @Mutation(() => Boolean)
  @TrackActivity('delete_book')
  async deleteBook(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    try {
      const result = await this.booksService.delete(id);
      this.logger.debug(`deletion result for book ${id}: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`failed to delete book ${id}`, error.stack);
      throw error;
    }
  }

  // resolves book authors
  @ResolveField('authors', () => [Author])
  async getAuthors(@Parent() book: BookModel, @Context() context: any) {
    try {
      if (!book.authors) {
        this.logger.debug(`no authors found for book ${book.id}`);
        return [];
      }
      return book.authors;
    } catch (error) {
      this.logger.error(
        `failed to resolve authors for book ${book.id}`,
        error.stack,
      );
      throw error;
    }
  }

  // checks if field exists in graphql query
  private hasField(info: GraphQLResolveInfo, fieldName: string): boolean {
    const selections = info.fieldNodes[0].selectionSet?.selections || [];
    return selections.some(
      (selection) =>
        selection.kind === 'Field' && selection.name.value === fieldName,
    );
  }
}
