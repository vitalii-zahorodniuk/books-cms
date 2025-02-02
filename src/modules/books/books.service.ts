import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Book } from '../../entities/book.entity';
import { Author } from '../../entities/author.entity';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { BookFilterInput, BookSortInput } from './dto/book-filter.input';
import { PaginationArgs } from '../../common/dto/pagination.args';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
  ) {}

  // handles complex book queries with filters and sorting
  async findAll(
    { skip, take }: PaginationArgs,
    filter?: BookFilterInput,
    sort?: BookSortInput,
    relations: string[] = [],
  ): Promise<Book[]> {
    try {
      const where: any = {};
      const order: any = {};

      // apply search filters
      if (filter?.title) {
        where.title = ILike(`%${filter.title}%`);
      }

      // handle year range filters
      if (filter?.yearFrom && filter?.yearTo) {
        where.year = Between(filter.yearFrom, filter.yearTo);
      } else if (filter?.yearFrom) {
        where.year = MoreThanOrEqual(filter.yearFrom);
      } else if (filter?.yearTo) {
        where.year = LessThanOrEqual(filter.yearTo);
      }

      // apply sort options
      if (sort?.title) order.title = sort.title;
      if (sort?.year) order.year = sort.year;
      if (sort?.createdAt) order.createdAt = sort.createdAt;

      const books = await this.booksRepository.find({
        where,
        order,
        skip,
        take,
        relations: relations.reduce(
          (acc, rel) => ({ ...acc, [rel]: true }),
          {},
        ),
      });

      this.logger.debug(`found ${books.length} books matching criteria`);
      return books.map((book) => ({
        ...book,
        authors: book.authors ?? [],
      }));
    } catch (error) {
      this.logger.error('failed to fetch books', error.stack);
      throw error;
    }
  }

  // fetches single book with authors
  async findOne(id: string): Promise<Book> {
    try {
      const book = await this.booksRepository.findOne({
        where: { id },
        relations: { authors: true },
      });

      if (!book) {
        this.logger.warn(`book ${id} not found`);
        throw new NotFoundException(`book ${id} not found`);
      }

      return book;
    } catch (error) {
      this.logger.error(`failed to fetch book ${id}`, error.stack);
      throw error;
    }
  }

  // handles book creation with author relations
  async create(createBookInput: CreateBookInput): Promise<Book> {
    try {
      const { authorIds, ...bookData } = createBookInput;

      let authors: Author[] = [];
      if (authorIds?.length) {
        authors = await this.authorsRepository.findBy({
          id: In(authorIds),
        });
        this.logger.debug(`found ${authors.length} authors for new book`);
      }

      const book = this.booksRepository.create({
        ...bookData,
        authors,
      });

      const savedBook = await this.booksRepository.save(book);
      this.logger.debug(`created book ${savedBook.id}`);
      return savedBook;
    } catch (error) {
      this.logger.error('failed to create book', error.stack);
      throw error;
    }
  }

  // handles book updates with author relations
  async update(id: string, input: UpdateBookInput): Promise<Book> {
    try {
      const { authorIds, ...bookData } = input;
      const book = await this.findOne(id);

      Object.assign(book, bookData);
      if (authorIds) {
        book.authors = await this.getAuthors(authorIds);
        this.logger.debug(`updated authors for book ${id}`);
      }

      const updatedBook = await this.booksRepository.save(book);
      this.logger.debug(`updated book ${id}`);
      return updatedBook;
    } catch (error) {
      this.logger.error(`failed to update book ${id}`, error.stack);
      throw error;
    }
  }

  // handles book deletion with checks
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.booksRepository.delete(id);
      const deleted = result?.affected ? result.affected > 0 : false;

      if (deleted) {
        this.logger.debug(`deleted book ${id}`);
      } else {
        this.logger.warn(`book ${id} not found for deletion`);
      }

      return deleted;
    } catch (error) {
      this.logger.error(`failed to delete book ${id}`, error.stack);
      throw error;
    }
  }

  // utility for fetching authors by ids
  private async getAuthors(authorIds: string[]): Promise<Author[]> {
    if (!authorIds?.length) return [];

    try {
      const authors = await this.authorsRepository.findBy({
        id: In(authorIds),
      });
      this.logger.debug(`found ${authors.length} authors by ids`);
      return authors;
    } catch (error) {
      this.logger.error('failed to fetch authors', error.stack);
      throw error;
    }
  }
}
