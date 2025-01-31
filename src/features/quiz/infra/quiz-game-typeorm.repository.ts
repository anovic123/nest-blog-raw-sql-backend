import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateGameDto } from "../api/models/dto/create-game.dto";
import { AddPlayerDto } from "../api/models/dto/add-player.dto";
import { QuizPlayer } from "../domain/quiz-player.entity";
import { GameViewDto } from "../api/models/output/game.view-dto";

import { GameStatus, QuizGame } from "../domain/quiz-games.entity";

@Injectable()
export class QuizGameTypeormRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly quizGameTypeormRepository: Repository<QuizGame>,
    @InjectRepository(QuizPlayer)
    private readonly quizPlayerTypeormRepository: Repository<QuizPlayer>
  ) {}

  public async createGame(dto: CreateGameDto): Promise<GameViewDto | null> {
    await this.quizGameTypeormRepository
    .createQueryBuilder()
    .insert()
    .values({
      id: dto.id,
      status: dto.status,
      pairCreatedDate: dto.pairCreatedData,
      firstPlayerId: String(dto.firstPlayerId),
    })
    .execute();
  
    const game = await this.quizGameTypeormRepository.findOne({
      where: { id: dto.id }
    })

    if (!game) return null

    const player = await this.quizPlayerTypeormRepository.createQueryBuilder('p').addSelect((subQuery) => {
      return subQuery
      .select('u.login', 'login')
      .from('users', 'u')
      .where('u.id = :userId', { userId: dto.firstPlayerId });
    }).where('p.id = :playerId', { playerId: game.firstPlayerId }).getRawOne();
    
    const pendingGameView: GameViewDto = {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.firstPlayerId,
          login: player.login
        },
        score: player.score
      },
      secondPlayerProgress: null,
      questions: null,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate
    }
    console.log("🚀 ~ QuizGameTypeormRepository ~ createGame ~ pendingGameView:", pendingGameView)

    return pendingGameView;
  }

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
  

  public async getActiveGame(userId: string): Promise<boolean> {
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
    
    return Boolean(game);
  
  }

  public async getPendingGame(): Promise<QuizGame | null> {
    return await this.quizGameTypeormRepository.findOne({
      where: {
        status: GameStatus.Pending
      }
    });
  }

  public async addPlayerToGame(dto: AddPlayerDto): Promise<boolean> {
    const res = await this.quizGameTypeormRepository.createQueryBuilder('q').update().set({
      secondPlayerId: dto.secondPlayerId,
      startGameDate: new Date(),
      status: GameStatus.Active
    }).execute();

    return true
  }

}
