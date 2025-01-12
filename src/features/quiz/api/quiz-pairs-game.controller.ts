import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";

import { SaQuizTypeormQueryRepository } from "../infra/sa-quiz-typeorm-query.repository";

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
  async getUserGame() {}

  @Get('/:id')
  @ApiOperation({
    summary: "Returns game by id"
  })
  async getGameById() {}

  @Post("/connections")
  @ApiOperation({
    summary: "Connect current user to existing random pending pair or create new pair which will be waiting second player"
  })
  async connectUserToPair() {}

  @Post("/my-current/answers")
  @ApiOperation({
    summary: "Send answer for next not answered question in active pair"
  })
  async sendAnswer() {}
}
