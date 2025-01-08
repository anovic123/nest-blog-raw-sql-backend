import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { QuizPlayer } from "./quiz-player.entity";

@Entity('quiz-users')
export class QuizUsers {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(() => QuizPlayer, (qp) => qp.user)
  players: QuizPlayer[]
}