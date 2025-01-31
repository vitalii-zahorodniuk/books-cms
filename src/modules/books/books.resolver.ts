import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
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

@Resolver(() => BookModel)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @Permissions(Permission.LIST_BOOKS)
  @Query(() => [BookModel])
  @TrackActivity('view_books')
  async books(
    @Args() paginationArgs: PaginationArgs,
    @Args('filter', { nullable: true }) filter?: BookFilterInput,
    @Args('sort', { nullable: true }) sort?: BookSortInput,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<BookModel[]> {
    const relations: string[] = [];
    if (info && this.hasField(info, 'authors')) {
      relations.push('authors');
    }
    return this.booksService.findAll(paginationArgs, filter, sort, relations);
  }

  @Permissions(Permission.READ_BOOK)
  @Query(() => BookModel)
  @TrackActivity('view_book')
  async book(@Args('id') id: string): Promise<BookModel> {
    return this.booksService.findOne(id);
  }

  @Permissions(Permission.CREATE_BOOK)
  @TrackUser()
  @Mutation(() => BookModel)
  @TrackActivity('create_book')
  async createBook(
    @Args('createBookInput') createBookInput: CreateBookInput,
  ): Promise<BookModel> {
    return this.booksService.create(createBookInput);
  }

  @Permissions(Permission.UPDATE_BOOK)
  @TrackUser()
  @Mutation(() => BookModel)
  @TrackActivity('update_book')
  async updateBook(
    @Args('id') id: string,
    @Args('input') input: UpdateBookInput,
  ): Promise<BookModel> {
    return this.booksService.update(id, input);
  }

  @Permissions(Permission.DELETE_BOOK)
  @Mutation(() => Boolean)
  @TrackActivity('delete_book')
  async deleteBook(@Args('id') id: string): Promise<boolean> {
    return this.booksService.delete(id);
  }

  @ResolveField('authors', () => [Author])
  async getAuthors(@Parent() book: BookModel) {
    if (!book.authors) {
      return [];
    }
    return book.authors;
  }

  private hasField(info: GraphQLResolveInfo, fieldName: string): boolean {
    const selections = info.fieldNodes[0].selectionSet?.selections || [];
    return selections.some(
      (selection) =>
        selection.kind === 'Field' && selection.name.value === fieldName,
    );
  }
}
