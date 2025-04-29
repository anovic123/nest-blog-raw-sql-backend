import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiBearerAuth } from "@nestjs/swagger";

import { AuthGuard } from "@core/guards/auth.guard";

import { ErrorProcessor } from "src/base/models/error-processor";
import { RequestWithUser } from "src/base/types/request";

import { QueryTopInputModel } from "../models/input/query.top.input.model";
import { QueryMyInputModel } from "../models/input/query.my.input.model";
import { AnswerInputModel } from "../models/input/answer.input.model";

import { GameQueryRepository } from "../../infra/game.query-repository";
import { GameExpirationCron } from "../../application/cron/game-expiration-cron.cron";

import { GetCurrentGameIdCommand } from "../../application/use-cases/game/get-current-game-id.use-case";
import { IsGameExistsAndUserParticipantCommand } from "../../application/use-cases/game/is-game-exists-and-user-participant.use-case";
import { ConnectionToGameCommand } from "../../application/use-cases/game/connection-to-game.use-case";
import { CheckTheAnswersCommand } from "../../application/use-cases/game/check-the-answers.use-case";

@Controller('pair-game-quiz')
export class PairGameQuizController {
  constructor(
    private commandBus: CommandBus,
    protected gameQueryRepository: GameQueryRepository,
    private gameService: GameExpirationCron,
  ) {}

  @ApiBearerAuth()
  @Get('users/top')
  @HttpCode(HttpStatus.OK)
  async getPlayersTop(
    @Req() req: RequestWithUser,
    @Query()
    queryDto: QueryTopInputModel,
  ) {
    const user = req['user'];

    return await this.gameQueryRepository.findTopUsers({
      queryDto: queryDto,
      userId: user?.userId,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('pairs/my')
  @HttpCode(HttpStatus.OK)
  async getHistoryGamesForUser(
    @Req() req: RequestWithUser,
    @Query() queryDto: QueryMyInputModel,
  ) {
    const user = req['user'];

    return await this.gameQueryRepository.findHistoryForUser({
      queryDto: queryDto,
      userId: user?.userId,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('users/my-statistic')
  @HttpCode(HttpStatus.OK)
  async getStatisticForUser(
    @Req() req: RequestWithUser,
    @Query()
    queryDto: QueryMyInputModel,
  ) {
    const user = req['user'];

    return await this.gameQueryRepository.findStatisticForUser({
      queryDto: queryDto,
      userId: user?.userId,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('pairs/my-current')
  @HttpCode(HttpStatus.OK)
  async getCurrentGameForUser(@Req() req: RequestWithUser) {
    const user = req['user'];

    const result = await this.commandBus.execute(
      new GetCurrentGameIdCommand(user?.userId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return await this.gameQueryRepository.findGameById({ id: result.data });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('pairs/:id')
  @HttpCode(HttpStatus.OK)
  async getGameById(
    @Param('id', new ParseUUIDPipe()) gameId: string,
    @Req() req: RequestWithUser,
  ) {
    const user = req['user'];

    const result = await this.commandBus.execute(
      new IsGameExistsAndUserParticipantCommand(user?.userId, gameId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return await this.gameQueryRepository.findGameById({ id: gameId });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  async answers(@Req() req: RequestWithUser, @Body() inputModel: AnswerInputModel) {
    const user = req['user'];

    const result = await this.commandBus.execute(
      new CheckTheAnswersCommand(user?.userId, inputModel.answer),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return result.data;
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  async connection(@Req() req: RequestWithUser) {
    const user = req['user'];

    const result = await this.commandBus.execute(
      new ConnectionToGameCommand(user?.userId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    } else {
      return await this.gameQueryRepository.findGameById({ id: result.data });
    }
  }

  @Get('expire')
  @HttpCode(200)
  async getExpire() {
    await this.gameService.handleExpiredGames();
  }
}
