import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { Game } from "../domain/game.entity";
import { Player } from "../domain/player.entity";
import { GameQuestion } from "../domain/game.question.entity";
import { Answer } from "../domain/answer.entity";

import { QueryMyInputModel } from "../api/models/input/query.my.input.model";
import { paginationModelMapper } from "src/base/models/pagination.output.model";
import { QueryTopInputModel } from "../api/models/input/query.top.input.model";
import { MyStatisticViewModel } from "../api/models/output/game/my-stattistics.view.model";
import { AnswersViewModel, GamePairViewModel, QuestionViewModel } from "../api/models/output/game/game.view.model";
import { TopGamePlayerViewModel } from "../api/models/output/game/top.game.player.model";

import { PlayerStatus } from "../api/models/enums/player-status";

@Injectable()
export class GameQueryRepository {
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

  public async findGameWithLoginUser(id: string) {
    return this.gameRepository.findOne({
      where: { id: id },
      relations: ['player_1', 'player_2', 'player_1.user', 'player_2.user'],
    });
  }

  public async findGameById(param: { id: string }) {
    const resultGame = await this.gameRepository
      .createQueryBuilder('games')
      .select([
        'games.id',
        'games.status',
        'games."createdAt"',
        'games."startGameDate"',
        'games."finishGameDate"',
      ])

      .leftJoin('players', 'pl1', 'pl1.id = games.player_1_id')
      .addSelect('pl1.id', 'player1_id')
      .addSelect('pl1.score', 'player1_score')
      .addSelect('pl1.userId', 'player1_userId')
      .leftJoin('users', 'users_pl1', 'users_pl1.id = pl1.userId')
      .addSelect('users_pl1."login"', 'loginPlayer1')

      .leftJoin('players', 'pl2', 'pl2.id = games.player_2_id')
      .addSelect('pl2.id', 'player2_id')
      .addSelect('pl2.score', 'player2_score')
      .addSelect('pl2.userId', 'player2_userId')
      .leftJoin('users', 'users_pl2', 'users_pl2.id = pl2.userId')
      .addSelect('users_pl2."login"', 'loginPlayer2')

      .where('games.id =:id', { id: param.id })
      .getRawOne();

    const resAnswersForPlayer1 = await this.answerRepository
      .createQueryBuilder()
      .select('"questionId"')
      .addSelect('status', 'answerStatus')
      .addSelect('"createdAt"', 'addedAt')
      .where('"playerId" = :playerId', { playerId: resultGame.player1_id })
      .orderBy('"createdAt"', 'ASC')
      .getRawMany();

    const resAnswersForPlayer2 = await this.answerRepository
      .createQueryBuilder()
      .select('"questionId"')
      .addSelect('status', 'answerStatus')
      .addSelect('"createdAt"', 'addedAt')
      .where('"playerId" = :playerId', { playerId: resultGame.player2_id })
      .orderBy('"createdAt"', 'ASC')
      .getRawMany();

    const resQuestions = await this.gameQuestionRepository
      .createQueryBuilder('qg')
      .leftJoin('questions', 'q', 'qg."questionId" = q.id')
      .select(['q.id', 'q.body'])
      .where('qg.gameId = :gameId', { gameId: resultGame.games_id })
      .orderBy('qg.id', 'ASC')
      .getRawMany();

    const answersForPlayer1 = resAnswersForPlayer1.map((answer) =>
      this.mapAnswersForPlayer(answer),
    );
    const answersForPlayer2 = resAnswersForPlayer2.map((answer) =>
      this.mapAnswersForPlayer(answer),
    );
    const questions = resQuestions.map((q) => this.mapQuestions(q));

    return this.mapGamePairViewModel({
      resultGame,
      answersForPlayer1,
      answersForPlayer2,
      questions,
    });
  }
  public async findQuestionGameForView(ids: number[]) {
    return this.gameQuestionRepository.find({
      where: { id: In(ids) },
      relations: ['question'],
      order: { id: 'ASC' },
    });
  }

  public  async findHistoryForUser(param: {
    queryDto: QueryMyInputModel;
    userId: string;
  }) {
    const limit = param.queryDto.pageSize;
    const offset = (param.queryDto.pageNumber - 1) * param.queryDto.pageSize;
    const sortDirection = (
      param.queryDto.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    ) as 'ASC' | 'DESC';
    const sortBy =
      param.queryDto.sortBy === 'pairCreatedDate'
        ? `games.createdAt`
        : `games."${param.queryDto.sortBy}"`;
    const sortByPairCreatedDate = `games.createdAt`;
    const sortDirectionPairCreatedDate = 'DESC';

    const gameQueryBuilder = this.gameRepository
      .createQueryBuilder('games')
      .select([
        'games.id',
        'games.status',
        'games."createdAt"',
        'games."startGameDate"',
        'games."finishGameDate"',
      ])

      .leftJoin('players', 'pl1', 'pl1.id = games.player_1_id')
      .addSelect('pl1.id', 'player1_id')
      .addSelect('pl1.score', 'player1_score')
      .addSelect('pl1.userId', 'player1_userId')
      .leftJoin('users', 'users_pl1', 'users_pl1.id = pl1.userId')
      .addSelect('users_pl1."login"', 'loginPlayer1')

      .leftJoin('players', 'pl2', 'pl2.id = games.player_2_id')
      .addSelect('pl2.id', 'player2_id')
      .addSelect('pl2.score', 'player2_score')
      .addSelect('pl2.userId', 'player2_userId')
      .leftJoin('users', 'users_pl2', 'users_pl2.id = pl2.userId')
      .addSelect('users_pl2."login"', 'loginPlayer2')

      .where('pl1.userId =:userId or pl2.userId =:userId', {
        userId: param.userId,
      })
      .orderBy(sortBy, sortDirection);
    if (param.queryDto.sortBy !== 'pairCreatedDate') {
      gameQueryBuilder.addOrderBy(
        sortByPairCreatedDate,
        sortDirectionPairCreatedDate,
      );
    }
    gameQueryBuilder.offset(offset).limit(limit);

    const countGames = await gameQueryBuilder.getCount();
    const resultGame = await gameQueryBuilder.getRawMany();

    const playerIds = resultGame.flatMap((game) => [
      game.player1_id,
      game.player2_id,
    ]);

    const resAnswersForPlayers = await this.answerRepository
      .createQueryBuilder()
      .select('"questionId"')
      .addSelect('"playerId"')
      .addSelect('status', 'answerStatus')
      .addSelect('"createdAt"', 'addedAt')
      .where('"playerId" IN (:...playerIds)', {
        playerIds: playerIds,
      })
      .orderBy('"playerId"', 'ASC')
      .addOrderBy('"createdAt"', 'ASC')
      .getRawMany();

    const answersByIds = resAnswersForPlayers.reduce((acc, answer) => {
      if (!acc[answer.playerId]) {
        acc[answer.playerId] = [];
      }
      acc[answer.playerId].push({
        questionId: answer.questionId,
        answerStatus: answer.answerStatus,
        addedAt: answer.addedAt.toISOString(),
      });
      return acc;
    }, {});

    const gameIds = resultGame.map((g) => g.games_id);

    const resQuestions = await this.gameQuestionRepository
      .createQueryBuilder('qg')
      .leftJoin('questions', 'q', 'qg."questionId" = q.id')
      .select(['q.id', 'q.body', 'qg.gameId'])
      .where('qg.gameId IN (:...gameIds)', { gameIds: gameIds })
      .orderBy('qg.gameId', 'ASC')
      .addOrderBy('qg.id', 'ASC')
      .getRawMany();

    const questionsByIds = resQuestions.reduce((acc, quest) => {
      if (!acc[quest.gameId]) {
        acc[quest.gameId] = [];
      }
      acc[quest.gameId].push({
        id: quest.q_id,
        body: quest.q_body,
      });
      return acc;
    }, {});

    const gamesWithAnswers = resultGame.map((game) => {
      const answersForPlayer1 = answersByIds[game.player1_id] || [];
      const answersForPlayer2 = answersByIds[game.player2_id] || [];
      const questions = questionsByIds[game.games_id] || [];
      return this.mapGamePairViewModel({
        resultGame: game,
        answersForPlayer1,
        answersForPlayer2,
        questions,
      });
    });
    return paginationModelMapper(
      {
        pageSize: param.queryDto.pageSize,
        pageNumber: param.queryDto.pageNumber,
      },
      countGames,
      gamesWithAnswers,
    );
  }

  public async findStatisticForUser(param: {
    queryDto: QueryMyInputModel;
    userId: string;
  }) {
    const subQueryPlayersStatus = this.playerRepository
      .createQueryBuilder()
      .select('"playerStatus"')
      .addSelect('Count(*)', 'count')
      .where('"userId" = :userId', { userId: param.userId })
      .groupBy('"playerStatus"');

    const result = await this.playerRepository
      .createQueryBuilder('pl')
      .select('SUM(pl.score)', 'sumScore')
      .addSelect('COUNT(pl.id)', 'gamesCount')
      .addSelect('AVG(pl.score)', 'avgScores')
      .where('pl."userId" = :userId', { userId: param.userId })
      .addSelect(
        'CAST(COALESCE("statusWinner".count, 0) AS INTEGER) AS "winsCount"',
      )
      .addSelect(
        'CAST(COALESCE("statusLoser".count, 0) AS INTEGER) AS "lossesCount"',
      )
      .addSelect(
        'CAST(COALESCE("statusDraw".count, 0) AS INTEGER) AS "drawsCount"',
      )
      .addCommonTableExpression(subQueryPlayersStatus, 'statusWinner')
      .addCommonTableExpression(subQueryPlayersStatus, 'statusLoser')
      .addCommonTableExpression(subQueryPlayersStatus, 'statusDraw')
      .leftJoin(
        'statusWinner',
        'statusWinner',
        '"statusWinner"."playerStatus" = :winner',
        { winner: PlayerStatus.Winner },
      )
      .leftJoin(
        'statusLoser',
        'statusLoser',
        '"statusLoser"."playerStatus" = :loser',
        { loser: PlayerStatus.Loser },
      )
      .leftJoin(
        'statusDraw',
        'statusDraw',
        '"statusDraw"."playerStatus" = :draw',
        { draw: PlayerStatus.Draw },
      )
      .groupBy('pl."userId"')
      .addGroupBy('"statusWinner".count')
      .addGroupBy('"statusLoser".count')
      .addGroupBy('"statusDraw".count')
      .getRawOne();

    return this.mapMyStatistic(result);
  }

  public async findTopUsers(param: { queryDto: QueryTopInputModel; userId: string }) {
    const limit = param.queryDto.pageSize;
    const offset = (param.queryDto.pageNumber - 1) * param.queryDto.pageSize;

    const parsedSort = param.queryDto.sort.map((item) => {
      const [key, order] = item.split(' ');
      return {
        key,
        order: order.replace('.', '').toLowerCase().includes('asc')
          ? 'ASC'
          : ('DESC' as 'ASC' | 'DESC'),
      };
    });

    const subQueryPlayersStatus = this.playerRepository
      .createQueryBuilder()
      .select('"playerStatus"')
      .addSelect('"userId"')
      .addSelect('Count(*)', 'count')
      .groupBy('"playerStatus"')
      .addGroupBy('"userId"');

    const resultBuilder = this.playerRepository
      .createQueryBuilder('pl')
      .select('SUM(pl.score)', 'sumScore')
      .addSelect('pl."userId"')
      .addSelect('COUNT(pl.id)', 'gamesCount')
      .addSelect('AVG(pl.score)', 'avgScores')

      .addSelect(
        'CAST(COALESCE("statusWinner".count, 0) AS INTEGER) AS "winsCount"',
      )
      .addSelect(
        'CAST(COALESCE("statusLoser".count, 0) AS INTEGER) AS "lossesCount"',
      )
      .addSelect(
        'CAST(COALESCE("statusDraw".count, 0) AS INTEGER) AS "drawsCount"',
      )
      .addSelect('users."login"', 'login')
      .addCommonTableExpression(subQueryPlayersStatus, 'statusWinner')
      .addCommonTableExpression(subQueryPlayersStatus, 'statusLoser')
      .addCommonTableExpression(subQueryPlayersStatus, 'statusDraw')
      .leftJoin('users', 'users', 'pl."userId" = users.id')
      .leftJoin(
        'statusWinner',
        'statusWinner',
        'pl."userId" = "statusWinner"."userId" AND "statusWinner"."playerStatus" = :winner',
        { winner: PlayerStatus.Winner },
      )
      .leftJoin(
        'statusLoser',
        'statusLoser',
        'pl."userId" = "statusLoser"."userId" AND  "statusLoser"."playerStatus" = :loser',
        { loser: PlayerStatus.Loser },
      )
      .leftJoin(
        'statusDraw',
        'statusDraw',
        'pl."userId" = "statusDraw"."userId" AND "statusDraw"."playerStatus" = :draw',
        { draw: PlayerStatus.Draw },
      )
      .groupBy('pl."userId"')
      .addGroupBy('"statusWinner".count')
      .addGroupBy('"statusLoser".count')
      .addGroupBy('"statusDraw".count')
      .addGroupBy('users."login"');

    parsedSort.forEach((el) => {
      resultBuilder.addOrderBy(`"${el.key}"`, el.order);
    });
    resultBuilder.limit(limit).offset(offset);
    const items = await resultBuilder.getRawMany();
    const itemsForPaginator = items.map((userForTop) =>
      this.mapTopUser(userForTop),
    );

    const countResult = await this.playerRepository
      .createQueryBuilder('pl')
      .select('COUNT(DISTINCT pl."userId")', 'totalCount')
      .getRawOne();

    return paginationModelMapper(
      param.queryDto,
      // 10,
      +countResult.totalCount,
      itemsForPaginator,
    );
  }
  public mapMyStatistic = (statistic): MyStatisticViewModel => {
    return {
      sumScore: +statistic.sumScore,
      avgScores: +(+statistic.avgScores).toFixed(2),
      gamesCount: +statistic.gamesCount,
      winsCount: statistic.winsCount,
      lossesCount: statistic.lossesCount,
      drawsCount: statistic.drawsCount,
    };
  };
  public  mapAnswersForPlayer = (answer): AnswersViewModel => {
    return {
      questionId: answer.questionId,
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt.toISOString(),
    };
  };
  public mapQuestions = (q): QuestionViewModel => {
    return {
      id: q.q_id,
      body: q.q_body,
    };
  };
  public mapGamePairViewModel(param: {
    resultGame: any;
    answersForPlayer1: any[];
    answersForPlayer2: any[];
    questions: any[];
  }): GamePairViewModel {
    return {
      id: param.resultGame.games_id,
      firstPlayerProgress: {
        answers: param.answersForPlayer1,
        player: {
          id: param.resultGame.player1_userId,
          login: param.resultGame.loginPlayer1,
        },
        score: param.resultGame.player1_score,
      },
      // @ts-ignore
      secondPlayerProgress: !param.resultGame.player2_id
        ? null
        : {
            answers: param.answersForPlayer2,
            player: {
              id: param.resultGame.player2_userId,
              login: param.resultGame.loginPlayer2,
            },
            score: param.resultGame.player2_score,
          },
          // @ts-ignore
      questions: param.questions.length === 0 ? null : param.questions,
      status: param.resultGame.games_status,
      pairCreatedDate: param.resultGame.createdAt.toISOString(),
      startGameDate: !param.resultGame.startGameDate
        ? null
        : param.resultGame.startGameDate.toISOString(),
      finishGameDate: !param.resultGame.finishGameDate
        ? null
        : param.resultGame.finishGameDate.toISOString(),
    };
  }

  private mapTopUser(userForTop: any): TopGamePlayerViewModel {
    return {
      gamesCount: +userForTop.gamesCount,
      winsCount: +userForTop.winsCount,
      lossesCount: +userForTop.lossesCount,
      drawsCount: +userForTop.drawsCount,
      sumScore: +userForTop.sumScore,
      avgScores: +(+userForTop.avgScores).toFixed(2),
      player: {
        id: userForTop.userId,
        login: userForTop.login,
      },
    };
  }
}