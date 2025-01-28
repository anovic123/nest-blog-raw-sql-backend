import { MigrationInterface, QueryRunner } from "typeorm";

export class QuizPlayers1738019480468 implements MigrationInterface {
    name = 'QuizPlayers1738019480468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP CONSTRAINT "FK_8b0910e737a2346582409dcb220"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD CONSTRAINT "FK_8b0910e737a2346582409dcb220" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP CONSTRAINT "FK_8b0910e737a2346582409dcb220"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD CONSTRAINT "FK_8b0910e737a2346582409dcb220" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
