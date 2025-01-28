import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { QuizPlayer } from "./quiz-player.entity";

@Entity('quiz-users')
export class QuizUsers {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToMany(() => QuizPlayer, (qp) => qp.user)
  players: QuizPlayer[]
}
