import { Column, Entity, OneToMany } from "typeorm";

import { BaseEntity } from "@core/entities/base.entity";

import { Answer } from "./answer.entity";
import { GameQuestion } from "./game.question.entity";

@Entity({ name: 'questions' })
export class Question extends BaseEntity {
  @Column()
  body: string;

  @Column('simple-json')
  answers: string[];

  @Column({ default: false })
  published: boolean;

  @OneToMany(() => Answer, (a) => a.question)
  answersPlayers: Answer[];

  @OneToMany(() => GameQuestion, (a) => a.question)
  gameQuestions: GameQuestion[];

  static create(body: string, answers: string[]): Question {
    const question = new Question();
    question.body = body;
    question.answers = answers;
    return question;
  }
}
