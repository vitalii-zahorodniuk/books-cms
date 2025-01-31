import { MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Author } from '../entities/author.entity';
import { Book } from '../entities/book.entity';
import { Permission as PermissionEnum } from '../common/enums/permissions.enum';
import { UserRole } from '../common/enums/roles.enum';
import * as bcrypt from 'bcrypt';

export class SeedInitialData1738183864000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create admin user first
    const salt = await bcrypt.genSalt();
    const admin = await queryRunner.manager.save(User, {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', salt),
      salt,
      isActive: true,
    });

    // create permissions with admin as creator
    const permissions = await Promise.all(
      Object.values(PermissionEnum).map((name) =>
        queryRunner.manager.save(Permission, {
          name,
          createdBy: admin,
        }),
      ),
    );

    // create roles
    const adminRole = await queryRunner.manager.save(Role, {
      name: UserRole.ADMIN,
      description: 'Super admin role with all permissions',
      permissions,
      createdBy: admin,
    });

    const userRole = await queryRunner.manager.save(Role, {
      name: UserRole.USER,
      description: 'Regular user role with read permissions',
      permissions: permissions.filter(
        (p) =>
          p.name === PermissionEnum.LIST_BOOKS ||
          p.name === PermissionEnum.READ_BOOK,
      ),
      createdBy: admin,
    });

    // assign admin role to admin user
    admin.roles = [adminRole];
    await queryRunner.manager.save(User, admin);

    // create regular user
    await queryRunner.manager.save(User, {
      email: 'user@example.com',
      password: await bcrypt.hash('user123', salt),
      salt,
      roles: [userRole],
      isActive: true,
      createdBy: admin,
    });

    // create authors
    const authors = await Promise.all([
      queryRunner.manager.save(Author, {
        name: 'George Orwell',
        createdBy: admin,
      }),
      queryRunner.manager.save(Author, {
        name: 'J.R.R. Tolkien',
        createdBy: admin,
      }),
      queryRunner.manager.save(Author, {
        name: 'J.K. Rowling',
        createdBy: admin,
      }),
    ]);

    // create books
    await Promise.all([
      // George Orwell books
      queryRunner.manager.save(Book, {
        title: '1984',
        description: 'A dystopian social science fiction novel',
        year: 1949,
        authors: [authors[0]],
        createdBy: admin,
      }),
      queryRunner.manager.save(Book, {
        title: 'Animal Farm',
        description: 'An allegorical novella',
        year: 1945,
        authors: [authors[0]],
        createdBy: admin,
      }),
      queryRunner.manager.save(Book, {
        title: 'Homage to Catalonia',
        description: 'A personal account of the Spanish Civil War',
        year: 1938,
        authors: [authors[0]],
        createdBy: admin,
      }),

      // Tolkien books
      queryRunner.manager.save(Book, {
        title: 'The Hobbit',
        description: 'A fantasy novel',
        year: 1937,
        authors: [authors[1]],
        createdBy: admin,
      }),
      queryRunner.manager.save(Book, {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        description: 'First volume of the epic high-fantasy novel',
        year: 1954,
        authors: [authors[1]],
        createdBy: admin,
      }),
      queryRunner.manager.save(Book, {
        title: 'The Silmarillion',
        description: 'Collection of mythopoeic stories',
        year: 1977,
        authors: [authors[1]],
        createdBy: admin,
      }),

      // Rowling books
      queryRunner.manager.save(Book, {
        title: "Harry Potter and the Philosopher's Stone",
        description: 'First book in the Harry Potter series',
        year: 1997,
        authors: [authors[2]],
        createdBy: admin,
      }),
      queryRunner.manager.save(Book, {
        title: 'Harry Potter and the Chamber of Secrets',
        description: 'Second book in the Harry Potter series',
        year: 1998,
        authors: [authors[2]],
        createdBy: admin,
      }),
      queryRunner.manager.save(Book, {
        title: 'Harry Potter and the Prisoner of Azkaban',
        description: 'Third book in the Harry Potter series',
        year: 1999,
        authors: [authors[2]],
        createdBy: admin,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // first remove all relationships
    await queryRunner.query(`DELETE
                             FROM book_authors`);
    await queryRunner.query(`DELETE
                             FROM user_roles`);
    await queryRunner.query(`DELETE
                             FROM role_permissions`);

    // then remove dependent entities
    await queryRunner.query(`DELETE
                             FROM books`);
    await queryRunner.query(`DELETE
                             FROM authors`);
    await queryRunner.query(`DELETE
                             FROM permissions`);
    await queryRunner.query(`DELETE
                             FROM roles`);

    // finally remove users
    await queryRunner.query(`DELETE
                             FROM users`);
  }
}
