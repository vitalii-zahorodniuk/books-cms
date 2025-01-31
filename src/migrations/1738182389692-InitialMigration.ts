import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1738182389692 implements MigrationInterface {
  name = 'InitialMigration1738182389692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions"
       (
           "created_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "updated_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "created_by_id" uuid,
           "updated_by_id" uuid,
           "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "name"          character varying NOT NULL,
           "description"   text,
           CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"),
           CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles"
       (
           "created_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "updated_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "created_by_id" uuid,
           "updated_by_id" uuid,
           "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "name"          character varying NOT NULL,
           "description"   text,
           CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
           CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "users"
       (
           "created_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "updated_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "created_by_id" uuid,
           "updated_by_id" uuid,
           "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "email"         character varying NOT NULL,
           "password"      character varying NOT NULL,
           "salt"          character varying NOT NULL,
           "isActive"      boolean           NOT NULL DEFAULT true,
           CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
           CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "authors"
       (
           "created_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "updated_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "created_by_id" uuid,
           "updated_by_id" uuid,
           "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "name"          character varying NOT NULL,
           CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "books"
       (
           "created_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "updated_at"    TIMESTAMP         NOT NULL DEFAULT now(),
           "created_by_id" uuid,
           "updated_by_id" uuid,
           "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
           "title"         character varying NOT NULL,
           "description"   text,
           "year"          integer           NOT NULL,
           CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions"
       (
           "role_id"       uuid NOT NULL,
           "permission_id" uuid NOT NULL,
           CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id")
       )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles"
       (
           "user_id" uuid NOT NULL,
           "role_id" uuid NOT NULL,
           CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id")
       )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "book_authors"
       (
           "book_id"   uuid NOT NULL,
           "author_id" uuid NOT NULL,
           CONSTRAINT "PK_75172094a131109db714f4f2bc7" PRIMARY KEY ("book_id", "author_id")
       )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d68802baf370cd6818cad7a50" ON "book_authors" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fb8ac32a0a0bbca076b2cf7c5" ON "book_authors" ("author_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions"
          ADD CONSTRAINT "FK_c3c2504053ba7833fe9f1985531" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions"
          ADD CONSTRAINT "FK_558233de32f30a3ee243854e188" FOREIGN KEY ("updated_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles"
          ADD CONSTRAINT "FK_4a4bff0f02e88cbdf770241ca8f" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles"
          ADD CONSTRAINT "FK_42353a3d71b2924e2b384901d7f" FOREIGN KEY ("updated_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users"
          ADD CONSTRAINT "FK_1bbd34899b8e74ef2a7f3212806" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users"
          ADD CONSTRAINT "FK_80e310e761f458f272c20ea6add" FOREIGN KEY ("updated_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "authors"
          ADD CONSTRAINT "FK_b7aa31e075c85824a65157214f4" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "authors"
          ADD CONSTRAINT "FK_f68a73227bc6d7a2b1df959f9b6" FOREIGN KEY ("updated_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "books"
          ADD CONSTRAINT "FK_a28a9003fcd73a402f461e55b7d" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "books"
          ADD CONSTRAINT "FK_f8dc2840a8c656dd8abd33a013a" FOREIGN KEY ("updated_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions"
          ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions"
          ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles"
          ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles"
          ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors"
          ADD CONSTRAINT "FK_1d68802baf370cd6818cad7a503" FOREIGN KEY ("book_id") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors"
          ADD CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a" FOREIGN KEY ("author_id") REFERENCES "authors" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_authors"
          DROP CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors"
          DROP CONSTRAINT "FK_1d68802baf370cd6818cad7a503"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles"
          DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles"
          DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions"
          DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions"
          DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books"
          DROP CONSTRAINT "FK_f8dc2840a8c656dd8abd33a013a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books"
          DROP CONSTRAINT "FK_a28a9003fcd73a402f461e55b7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "authors"
          DROP CONSTRAINT "FK_f68a73227bc6d7a2b1df959f9b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "authors"
          DROP CONSTRAINT "FK_b7aa31e075c85824a65157214f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users"
          DROP CONSTRAINT "FK_80e310e761f458f272c20ea6add"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users"
          DROP CONSTRAINT "FK_1bbd34899b8e74ef2a7f3212806"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles"
          DROP CONSTRAINT "FK_42353a3d71b2924e2b384901d7f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles"
          DROP CONSTRAINT "FK_4a4bff0f02e88cbdf770241ca8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions"
          DROP CONSTRAINT "FK_558233de32f30a3ee243854e188"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions"
          DROP CONSTRAINT "FK_c3c2504053ba7833fe9f1985531"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6fb8ac32a0a0bbca076b2cf7c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d68802baf370cd6818cad7a50"`,
    );
    await queryRunner.query(`DROP TABLE "book_authors"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`,
    );
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TABLE "authors"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
