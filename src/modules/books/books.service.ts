import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) {}

  // get list of books with pagination and filters
  async findAll(
    { skip, take }: PaginationArgs,
    filter?: BookFilterInput,
    sort?: BookSortInput,
    relations: string[] = [],
  ): Promise<Book[]> {
    const where: any = {};
    const order: any = {};

    if (filter?.title) {
      where.title = ILike(`%${filter.title}%`);
    }

    if (filter?.yearFrom && filter?.yearTo) {
      where.year = Between(filter.yearFrom, filter.yearTo);
    } else if (filter?.yearFrom) {
      where.year = MoreThanOrEqual(filter.yearFrom);
    } else if (filter?.yearTo) {
      where.year = LessThanOrEqual(filter.yearTo);
    }

    if (sort?.title) {
      order.title = sort.title;
    }
    if (sort?.year) {
      order.year = sort.year;
    }
    if (sort?.createdAt) {
      order.createdAt = sort.createdAt;
    }

    const books = await this.booksRepository.find({
      where,
      order,
      skip,
      take,
      relations: relations.reduce((acc, rel) => ({ ...acc, [rel]: true }), {}),
    });

    return books.map((book) => ({
      ...book,
      authors: book.authors ?? [],
    }));
  }

  // get single book by id
  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: {
        authors: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }

    return book;
  }

  // create new book with authors
  async create(createBookInput: CreateBookInput): Promise<Book> {
    const { authorIds, ...bookData } = createBookInput;

    let authors: Author[] = [];
    if (authorIds && authorIds.length > 0) {
      authors = await this.authorsRepository.findBy({
        id: In(authorIds),
      });
    }

    const book = this.booksRepository.create({
      ...bookData,
      authors,
    });

    return this.booksRepository.save(book);
  }

  // update existing book
  async update(id: string, input: UpdateBookInput): Promise<Book> {
    const { authorIds, ...bookData } = input;
    const book = await this.findOne(id);

    Object.assign(book, bookData);
    if (authorIds) {
      book.authors = await this.getAuthors(authorIds);
    }

    return this.booksRepository.save(book);
  }

  // delete book by id
  async delete(id: string): Promise<boolean> {
    const result = await this.booksRepository.delete(id);
    return result?.affected ? result.affected > 0 : false;
  }

  private async getAuthors(authorIds: string[]): Promise<Author[]> {
    if (!authorIds?.length) return [];
    return this.authorsRepository.findBy({
      id: In(authorIds),
    });
  }
}
