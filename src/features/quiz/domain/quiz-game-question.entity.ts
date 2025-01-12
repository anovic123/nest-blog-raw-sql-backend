import { Column, Entity, OneToMany } from "typeorm";
import { randomUUID } from "crypto";

import { BaseEntity } from "../../../core/entities/base.entity";

import { QuizGameQuestions } from "./quiz-game-questions.entity";

import { CreateQuestionDto } from "../api/models/dto/create-question.dto";

@Entity('quiz-game-question')
export class QuizGameQuestion extends BaseEntity {
  @Column()
  body: string;

  @Column({ type: 'character varying', array: true })
  correctAnswers: string[];

  @Column()
  published: boolean;

  @OneToMany(() => QuizGameQuestions, (qgq) => qgq.question, { onDelete: 'CASCADE' })
  games: QuizGameQuestions[];

  static createQuestion(inputBody: CreateQuestionDto): QuizGameQuestion {
    const question = new QuizGameQuestion();

    const { body, correctAnswers } = inputBody;
    question.id = randomUUID();
    question.createdAt = new Date();
    question.body = body;
    question.correctAnswers = correctAnswers;
    question.published = false;

    return question;
  }
}