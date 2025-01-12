import { MigrationInterface, QueryRunner } from "typeorm";

export class QuizGameQuestions1736705730676 implements MigrationInterface {
    name = 'QuizGameQuestions1736705730676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD "correctAnswers" character varying array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD "published" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP CONSTRAINT "FK_88750b9306914a8824b6d42fd2d"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP CONSTRAINT "PK_9ba29a086e7765484535d3a0e19"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD CONSTRAINT "PK_9ba29a086e7765484535d3a0e19" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD "questionId" uuid`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD CONSTRAINT "FK_88750b9306914a8824b6d42fd2d" FOREIGN KEY ("questionId") REFERENCES "quiz-game-question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP CONSTRAINT "FK_88750b9306914a8824b6d42fd2d"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD "questionId" integer`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP CONSTRAINT "PK_9ba29a086e7765484535d3a0e19"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" ADD CONSTRAINT "PK_9ba29a086e7765484535d3a0e19" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD CONSTRAINT "FK_88750b9306914a8824b6d42fd2d" FOREIGN KEY ("questionId") REFERENCES "quiz-game-question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP COLUMN "published"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP COLUMN "correctAnswers"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-question" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
