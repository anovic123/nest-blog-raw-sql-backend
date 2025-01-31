import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { GameStatus, QuizGame } from "../domain/quiz-games.entity";
import { QuizPlayer } from "../domain/quiz-player.entity";
import { QuizGameQuestions } from "../domain/quiz-game-questions.entity";

@Injectable()
export class QuizGameTypeormQueryRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly quizGameTypeormRepository: Repository<QuizGame>, 
    @InjectRepository(QuizPlayer)
    private readonly quizPlayerTypeormRepository: Repository<QuizPlayer>,
    @InjectRepository(QuizGameQuestions)
    private readonly quizGameQuestionsTypeormRepository: Repository<QuizGameQuestions>
  ) {}

    public async getActiveGameDetails(playerId: string, gameStatus: GameStatus) {
      const game = await this.quizGameTypeormRepository
        .createQueryBuilder('g')
        .addSelect((subQuery) => {
          return subQuery
            .select('pl.login', 'firstPlayerLogin')
            .from('quiz-players', 'pl')
            .where('pl.id = g.firstPlayerId');
        }, 'firstPlayerLogin')
        .addSelect((subQuery) => {
          return subQuery
            .select('pl.score', 'firstPlayerScore')
            .from('quiz-players', 'pl')
            .where('pl.id = g.firstPlayerId');
        }, 'firstPlayerScore')
        .addSelect((subQuery) => {
          return subQuery
            .select('pl.login', 'secondPlayerLogin')
            .from('quiz-players', 'pl')
            .where('pl.id = g.secondPlayerId');
        }, 'secondPlayerLogin')
        .addSelect((subQuery) => {
          return subQuery
            .select('pl.score', 'secondPlayerScore')
            .from('quiz-players', 'pl')
            .where('pl.id = g.secondPlayerId');
        }, 'secondPlayerScore')
        .where('(g.firstPlayerId = :playerId OR g.secondPlayerId = :playerId)', { playerId })
        .andWhere('g.status = :gameStatus', { gameStatus })
        .getRawOne();
    
      return game;
    }
    
  
    public async getActiveOrPendingGame(userId: string): Promise<boolean> {
      const playerData = await this.quizPlayerTypeormRepository
      .createQueryBuilder('p')
      .leftJoin('p.user', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .select('p.id', 'playerId')
      .getRawOne();
  
      if (!playerData) return false;
      
      const playerId = playerData.playerId;
      const game = await this.getActiveGameDetails(playerId, GameStatus.Active);
      
      if (!game) {
        throw new NotFoundException("Active or pending game not found")
      }
      
      const questions = await 
        this.quizGameQuestionsTypeormRepository
        .createQueryBuilder('q')
        .select('q."id"', 'q."body"')
        .leftJoin('q."quiz-game-question"', 'qgq')
        .where('q."id" = qgq."questionId"')
        .andWhere('qgq."gameId" = :gameId', { gameId: game.id })
        .orderBy('qg."questionNumber"').execute();
      
      // const firstPlayerAnswers = await this.

      return true
    }
}