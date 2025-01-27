import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchemas1738004296865 implements MigrationInterface {
    name = 'UpdateSchemas1738004296865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "FK_87945642855e0bc64fb88eeb680"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "FK_bb198ad05e13dc9da1231738291"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP CONSTRAINT "FK_8b0910e737a2346582409dcb220"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP COLUMN "player1Id"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP COLUMN "player2Id"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD "questionNumber" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD "pairCreatedDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD "startGameDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD "finishGameDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD "firstPlayerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "UQ_69a39ada9c55fa03f03d5c3c6aa" UNIQUE ("firstPlayerId")`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD "secondPlayerId" integer`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "UQ_2cff83ed1831b55d88475afbffd" UNIQUE ("secondPlayerId")`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "answersCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "finishAnswersDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "login" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "answersId" integer`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "gameId" character varying`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quiz-answers" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."quiz-answers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "quiz-answers" ADD "status" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP CONSTRAINT "FK_a66a54da95fc473a2c4d0c4b481"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ALTER COLUMN "gameId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD CONSTRAINT "FK_a66a54da95fc473a2c4d0c4b481" FOREIGN KEY ("gameId") REFERENCES "quiz-games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "FK_69a39ada9c55fa03f03d5c3c6aa" FOREIGN KEY ("firstPlayerId") REFERENCES "quiz-players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "FK_2cff83ed1831b55d88475afbffd" FOREIGN KEY ("secondPlayerId") REFERENCES "quiz-players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD CONSTRAINT "FK_8b0910e737a2346582409dcb220" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD CONSTRAINT "FK_5572cfc8ac0502f327e4bcacaad" FOREIGN KEY ("answersId") REFERENCES "quiz-answers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP CONSTRAINT "FK_5572cfc8ac0502f327e4bcacaad"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP CONSTRAINT "FK_8b0910e737a2346582409dcb220"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "FK_2cff83ed1831b55d88475afbffd"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "FK_69a39ada9c55fa03f03d5c3c6aa"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP CONSTRAINT "FK_a66a54da95fc473a2c4d0c4b481"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ALTER COLUMN "gameId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD CONSTRAINT "FK_a66a54da95fc473a2c4d0c4b481" FOREIGN KEY ("gameId") REFERENCES "quiz-games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-answers" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."quiz-answers_status_enum" AS ENUM('Correct', 'Incorrect')`);
        await queryRunner.query(`ALTER TABLE "quiz-answers" ADD "status" "public"."quiz-answers_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "answersId"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "login"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "finishAnswersDate"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP COLUMN "answersCount"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "UQ_2cff83ed1831b55d88475afbffd"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP COLUMN "secondPlayerId"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "UQ_69a39ada9c55fa03f03d5c3c6aa"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP COLUMN "firstPlayerId"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP COLUMN "finishGameDate"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP COLUMN "startGameDate"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP COLUMN "pairCreatedDate"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP COLUMN "questionNumber"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD "player2Id" integer`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD "player1Id" integer`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD CONSTRAINT "FK_8b0910e737a2346582409dcb220" FOREIGN KEY ("userId") REFERENCES "quiz-users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "FK_bb198ad05e13dc9da1231738291" FOREIGN KEY ("player2Id") REFERENCES "quiz-players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "FK_87945642855e0bc64fb88eeb680" FOREIGN KEY ("player1Id") REFERENCES "quiz-players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
