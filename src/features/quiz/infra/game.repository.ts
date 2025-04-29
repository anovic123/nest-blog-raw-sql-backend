import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Game } from "../domain/game.entity";
import { Player } from "../domain/player.entity";
import { GameQuestion } from "../domain/game.question.entity";
import { Answer } from "../domain/answer.entity";

import { GameStatus } from "../api/models/enums/game-status";
import { PlayerStatus } from "../api/models/enums/player-status";

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  public async findPendingGame(): Promise<{ id: string; userForPlayer1: string }> {
    const pendingGame = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoin('game.player_1', 'player1')
      .leftJoin('player1.user', 'user1')
      .select(['game.id', 'user1.id'])
      .andWhere('game.status = :status', { status: GameStatus.Pending })
      .getRawOne();

      // @ts-ignore
    if (!pendingGame) return null;

    return { id: pendingGame.game_id, userForPlayer1: pendingGame.user1_id };
  }
  public async savePlayer(player: Player) {
    return this.playerRepository.save(player);
  }
  public async saveGame(game: Game) {
    return this.gameRepository.save(game);
  }

  public async addSecondUserAndActiveTheGame(param: {
    currentGameId: string;
    playerId: string;
  }) {
    await this.gameRepository.update(
      { id: param.currentGameId },
      {
        status: GameStatus.Active,
        player_2: { id: param.playerId },
        startGameDate: new Date(),
      },
    );
  }
  public async findGameById(param: { id: string }) {
    return this.gameRepository.findOneBy({ id: param.id });
  }

  public async findActiveGame(param: { currentUserId: string }) {
    return this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.player_1', 'player1')
      .leftJoinAndSelect('player1.user', 'user1')
      .leftJoinAndSelect('game.player_2', 'player2')
      .leftJoinAndSelect('player2.user', 'user2')
      .where('(user1.id = :userId OR user2.id = :userId)', {
        userId: param.currentUserId,
      })
      .andWhere('game.status = :status', { status: GameStatus.Active })
      .getOne();
  }
  public async findANotFinishedGame(param: { currentUserId: string }) {
    return this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.player_1', 'player1')
      .leftJoinAndSelect('player1.user', 'user1')
      .leftJoinAndSelect('game.player_2', 'player2')
      .leftJoinAndSelect('player2.user', 'user2')
      .where('(user1.id = :userId OR user2.id = :userId)', {
        userId: param.currentUserId,
      })
      .andWhere('game.status <> :status', { status: GameStatus.Finished })
      .getOne();
  }

  public async findGameForUser(param: { currentUserId: string; gameId: string }) {
    return this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.player_1', 'player1')
      .leftJoinAndSelect('player1.user', 'user1')
      .leftJoinAndSelect('game.player_2', 'player2')
      .leftJoinAndSelect('player2.user', 'user2')
      .where('(user1.id = :userId OR user2.id = :userId)', {
        userId: param.currentUserId,
      })
      .andWhere('game.id = :gameId', { gameId: param.gameId })
      .getOne();
  }

  public async saveQuestionsForGame(arrayForQuestion: GameQuestion[]) {
    return this.gameQuestionRepository.save(arrayForQuestion);
  }

  public async findPlayerWithCountAnswers(param: {
    playerId: string;
  }): Promise<{ id: string; answersCount: number }> {
    const res = await this.playerRepository
      .createQueryBuilder('players')
      .leftJoin('players.answers', 'answers')
      .addSelect('count(answers.id)', 'answersCount')
      .where('players.id =:playerId', { playerId: param.playerId })
      .groupBy('players.id')
      .getRawOne();
    return { id: res?.players_id ?? '3553ad76-8fa7-48e5-9b7d-3105f8778409', answersCount: (Number(res?.answersCount ?? 0)) };
  }

  public async increaseScoreForPlayer(param: { playerId: string }) {
    await this.playerRepository
      .createQueryBuilder()
      .update(Player)
      .set({ score: () => 'score + 1' })
      .where('id = :playerId', { playerId: param.playerId })
      .execute();
  }
  public async updatePlayerStatus(param: {
    playerId: string;
    playerStatus: PlayerStatus;
  }) {
    await this.playerRepository.update(
      {
        id: param.playerId,
      },
      { playerStatus: param.playerStatus },
    );
  }
  public async findCurrentQuestionForGame(param: {
    gameId: string;
    ordinalNumber: number;
  }): Promise<{ id: string; answers: string[]; questionId: string }> {
    const result = await this.gameQuestionRepository
      .createQueryBuilder('gq')
      .leftJoin('gq.question', 'q')
      .where('gq.gameId = :gameId', { gameId: param.gameId })
      .orderBy('gq.id', 'ASC')
      .offset(param.ordinalNumber)
      .select(['gq.id', 'gq.questionId', 'q.answers'])
      .getRawOne();

      // @ts-ignore
    if (!result) return null;
    return {
      id: result.gq_id,
      answers: result.q_answers,
      questionId: result.questionId,
    };
  }

  public async createAnswer(answer: Answer): Promise<Answer> {
    return this.answerRepository.save(answer);
  }

  public async getBonus(param: {
    currentPlayerId: string;
    opponentId: string;
    gameId: string;
    questionId: string;
  }) {
    const queryBuilder = this.answerRepository
      .createQueryBuilder('ap1')
      .leftJoin('answers', 'ap2', 'ap1.questionId = ap2.questionId')
      .select('ap1.createdAt < ap2.createdAt', 'bonusOfPlayer1')
      .addSelect('ap2.createdAt < ap1.createdAt', 'bonusOfPlayer2')
      .where('ap1.playerId =:currentPlayerId', {
        currentPlayerId: param.currentPlayerId,
      })
      .andWhere('ap2.playerId =:opponentId', { opponentId: param.opponentId })
      .andWhere('ap1.questionId =:questionId', {
        questionId: param.questionId,
      });

    const res = await queryBuilder.getRawOne();

    return {
      bonusOfPlayer1: res.bonusOfPlayer1,
      bonusOfPlayer2: res.bonusOfPlayer2,
    };
  }

  public async finishGame(id: string) {
    await this.gameRepository.update(
      { id: id },
      { status: GameStatus.Finished, finishGameDate: new Date() },
    );
  }

  public async findExpiredGame() {
    const currentDateMinus10sek = new Date(Date.now() - 9 * 1000);
    const queryBuilder = this.gameRepository
      .createQueryBuilder('games')
      .select('games.id', 'id')
      .leftJoin(
        'answers',
        'answers_pl1',
        'games."player_1_id" = answers_pl1."playerId"',
      )
      .leftJoin(
        'answers',
        'answers_pl2',
        'games."player_2_id" = answers_pl2."playerId"',
      )
      .addSelect('count(DISTINCT  answers_pl1.id)', 'count_pl1')
      .addSelect('count(DISTINCT  answers_pl2.id)', 'count_pl2')
      .addSelect('games."player_1_id"', 'player1')
      .addSelect('games."player_2_id"', 'player2')
      .addSelect('MAX( "answers_pl1"."createdAt")', 'lastdatepl1')
      .addSelect('MAX(  "answers_pl2"."createdAt")', 'lastdatepl2')
      .where('games.status = :status', { status: GameStatus.Active })
      .groupBy('games.id')
      .addGroupBy('answers_pl1."playerId"')
      .addGroupBy('answers_pl2."playerId"')
      .having(
        '(count(DISTINCT  answers_pl1.id) = 5 AND count(DISTINCT  answers_pl2.id) < 5 AND MAX( "answers_pl1"."createdAt") < :currentDateMinus10sek) OR (count(DISTINCT  answers_pl2.id) = 5 AND count(DISTINCT  answers_pl1.id) < 5 AND MAX( "answers_pl2"."createdAt") < :currentDateMinus10sek) ',
      )
      .setParameter('currentDateMinus10sek', currentDateMinus10sek);

    const result = await queryBuilder.getRawMany();
    return result.map((game) => ({
      gameId: game.id,
      player1: game.player1,
      player2: game.player2,
      count_pl1: +game.count_pl1,
      count_pl2: +game.count_pl2,
    }));
  }
}