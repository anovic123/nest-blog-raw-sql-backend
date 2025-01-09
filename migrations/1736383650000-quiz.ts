import { MigrationInterface, QueryRunner } from "typeorm";

export class Quiz1736383650000 implements MigrationInterface {
    name = 'Quiz1736383650000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`CREATE TABLE "quiz-answers" ("id" SERIAL NOT NULL, "questionId" integer NOT NULL, "status" "public"."quiz-answers_status_enum" NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, CONSTRAINT "PK_b3d0d1afb62cacd6a5615498102" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz-players" ("id" SERIAL NOT NULL, "score" integer NOT NULL DEFAULT '0', "userId" integer, CONSTRAINT "PK_7673fbcf61be7993fbbbd75aa32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz-users" ("id" SERIAL NOT NULL, CONSTRAINT "PK_4ef37027933f7afb29fd93e0b3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz-games" ("id" SERIAL NOT NULL, "status" "public"."quiz-games_status_enum" NOT NULL, "player1Id" integer, "player2Id" integer, CONSTRAINT "PK_e492397dcf841bd520782e5c8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz-game-question" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, CONSTRAINT "PK_9ba29a086e7765484535d3a0e19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz-game-questions" ("id" SERIAL NOT NULL, "gameId" integer, "questionId" integer, CONSTRAINT "PK_78f0c4fbbe0b24e57498565193d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "like-posts" DROP CONSTRAINT "UQ_3a295d23adc08c9c58d6596c462"`);
        await queryRunner.query(`ALTER TABLE "like-posts" DROP COLUMN "authorId"`);
        await queryRunner.query(`ALTER TABLE "like-posts" ADD "authorId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "like-posts" DROP COLUMN "postId"`);
        await queryRunner.query(`ALTER TABLE "like-posts" ADD "postId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "like-posts" ADD CONSTRAINT "UQ_3a295d23adc08c9c58d6596c462" UNIQUE ("authorId", "postId", "id")`);
        await queryRunner.query(`ALTER TABLE "quiz-answers" ADD CONSTRAINT "FK_5deae86af727ff44a61e07569bc" FOREIGN KEY ("playerId") REFERENCES "quiz-players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-players" ADD CONSTRAINT "FK_8b0910e737a2346582409dcb220" FOREIGN KEY ("userId") REFERENCES "quiz-users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "FK_87945642855e0bc64fb88eeb680" FOREIGN KEY ("player1Id") REFERENCES "quiz-players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-games" ADD CONSTRAINT "FK_bb198ad05e13dc9da1231738291" FOREIGN KEY ("player2Id") REFERENCES "quiz-players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD CONSTRAINT "FK_a66a54da95fc473a2c4d0c4b481" FOREIGN KEY ("gameId") REFERENCES "quiz-games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" ADD CONSTRAINT "FK_88750b9306914a8824b6d42fd2d" FOREIGN KEY ("questionId") REFERENCES "quiz-game-question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP CONSTRAINT "FK_88750b9306914a8824b6d42fd2d"`);
        await queryRunner.query(`ALTER TABLE "quiz-game-questions" DROP CONSTRAINT "FK_a66a54da95fc473a2c4d0c4b481"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "FK_bb198ad05e13dc9da1231738291"`);
        await queryRunner.query(`ALTER TABLE "quiz-games" DROP CONSTRAINT "FK_87945642855e0bc64fb88eeb680"`);
        await queryRunner.query(`ALTER TABLE "quiz-players" DROP CONSTRAINT "FK_8b0910e737a2346582409dcb220"`);
        await queryRunner.query(`ALTER TABLE "quiz-answers" DROP CONSTRAINT "FK_5deae86af727ff44a61e07569bc"`);
        await queryRunner.query(`ALTER TABLE "like-posts" DROP CONSTRAINT "UQ_3a295d23adc08c9c58d6596c462"`);
        await queryRunner.query(`ALTER TABLE "like-posts" DROP COLUMN "postId"`);
        await queryRunner.query(`ALTER TABLE "like-posts" ADD "postId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "like-posts" DROP COLUMN "authorId"`);
        await queryRunner.query(`ALTER TABLE "like-posts" ADD "authorId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "like-posts" ADD CONSTRAINT "UQ_3a295d23adc08c9c58d6596c462" UNIQUE ("id", "authorId", "postId")`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`DROP TABLE "quiz-game-questions"`);
        await queryRunner.query(`DROP TABLE "quiz-game-question"`);
        await queryRunner.query(`DROP TABLE "quiz-games"`);
        await queryRunner.query(`DROP TABLE "quiz-users"`);
        await queryRunner.query(`DROP TABLE "quiz-players"`);
        await queryRunner.query(`DROP TABLE "quiz-answers"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
