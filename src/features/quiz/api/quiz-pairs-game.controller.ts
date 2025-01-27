import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";

import { SaQuizTypeormQueryRepository } from "../infra/sa-quiz-typeorm-query.repository";
import { RequestWithUser } from "src/base/types/request";
import { GameViewDto } from "./models/output/game.view-dto";
import { CreateGameCommand } from "../application/pairs-use-cases/create-game.use-case";

@ApiTags('PairQuizGame')
@ApiBearerAuth()
@UseGuards(ApiBearerAuth)
@Controller('pair-game-quiz/pairs')
export class QuizPairsGameController {
  constructor (
    private readonly quizTypeormQueryRepository: SaQuizTypeormQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @Get('/my-current')
  @ApiOperation({
    summary: "Returns current unfinished user game"
  })
  async getUserGame(
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    return this.quizTypeormQueryRepository.getActiveOrPendingQuizGame(user?.userId)
  }

  @Get('/:id')
  @ApiOperation({
    summary: "Returns game by id"
  })
  async getGameById() {}

  @Post("/connection")
  @ApiOperation({
    summary: "Connect current user to existing random pending pair or create new pair which will be waiting second player"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns started existing pair or new pair with status 'PendingSecondPlayer'",
    type: GameViewDto
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "If current user is already participating in active pair"
  })
  async connectUserToPair(
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    return this.commandBus.execute(new CreateGameCommand(user?.userId))
  }

  @Post("/my-current/answers")
  @ApiOperation({
    summary: "Send answer for next not answered question in active pair"
  })
  async sendAnswer() {}
}
