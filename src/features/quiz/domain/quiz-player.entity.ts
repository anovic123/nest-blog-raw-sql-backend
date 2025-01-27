import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { QuizUsers } from "./quiz-users.entity";
import { QuizAnswers } from "./quiz-answers.entity";
import { User } from "../../users/domain/users.entity";
import { QuizGame } from "./quiz-games.entity";

@Entity('quiz-players')
export class QuizPlayer {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  answersCount: number;

  @Column({ nullable: true })
  finishAnswersDate: Date;

  @Column({ default: true })
  isActive: true;

  @ManyToOne(() => User, (u) => u.players, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User
  @Column()
  userId: string;
  @Column()
  login: string;

  @ManyToOne(() => QuizAnswers, (qa) => qa.player)
  @JoinColumn()
  answers: QuizAnswers[];
  @Column({ nullable: true })
  answersId: string[];

  @OneToOne(() => QuizGame, { nullable: true, onDelete: 'CASCADE' })
  game: QuizGame;
  @Column({ nullable: true })
  gameId: string;

  // @OneToMany(() => QuizAnswers, (qa) => qa.player)
  // answers: QuizAnswers
}