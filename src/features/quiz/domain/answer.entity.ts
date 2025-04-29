import { Column, Entity, ManyToOne, Unique } from "typeorm";

import { BaseEntity } from "@core/entities/base.entity";

import { Question } from "./question.entity";
import { Player } from "./player.entity";
import { AnswerStatus } from "../api/models/enums/answer-status";

@Unique(['id'])
@Entity({ name: 'answers' })
export class Answer extends BaseEntity {
  @ManyToOne(() => Question, (q) => q.answers)
  question: Question;

  @ManyToOne(() => Player, (p) => p.answers)
  player: Player;

  @Column()
  body: string;

  @Column()
  status: AnswerStatus;

  static create(
    playerId: string,
    questionId: string,
    status: AnswerStatus,
    body: string,
  ): Answer {
    const answer = new Answer();
    answer.question = { id: questionId } as Question;
    answer.player = { id: playerId } as Player;
    answer.status = status;
    answer.body = body;
    return answer;
  }
}