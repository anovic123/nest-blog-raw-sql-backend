import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { QuizUsers } from "./quiz-users.entity";
import { QuizAnswers } from "./quiz-answers.entity";

@Entity('quiz-players')
export class QuizPlayer {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => QuizUsers, (qu) => qu.players)
  user: QuizUsers

  @Column({ default: 0 })
  score: number

  @OneToMany(() => QuizAnswers, (qa) => qa.player)
  answers: QuizAnswers
}