import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiBasicAuth } from "@nestjs/swagger";

import { BasicAuthGuard } from "@core/guards/auth-basic.guards";

import { QuestionPublishInputModel } from "../models/input/question.publish.input.model";
import { QuestionInputModel } from "../models/input/question.input.model";
import { PaginationQuestionInputModel } from "../models/input/pagination.question.input.model";

import { QuestionsQueryRepository } from "../../infra/questions.query-repository";

import { ErrorProcessor } from "src/base/models/error-processor";

import { CreateQuestionCommand } from "../../application/use-cases/questions/create-question.use-case";
import { DeleteQuestionCommand } from "../../application/use-cases/questions/delete-question.use-case";
import { UpdateQuestionCommand } from "../../application/use-cases/questions/update-question.use-case";
import { UpdatePublishQuestionCommand } from "../../application/use-cases/questions/update-publish-question.use-case";

@Controller('sa/quiz/questions')
export class QuizSaController {
  constructor(
    private commandBus: CommandBus,
    protected questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @ApiBasicAuth()
  @Get()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getQuestions(
    @Query()
    queryDto: PaginationQuestionInputModel,
  ) {
    return await this.questionsQueryRepository.getAll(queryDto);
  }

  @ApiBasicAuth()
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteQuestion(
    @Param('id', new ParseUUIDPipe())
    questionId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteQuestionCommand(questionId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }

  @ApiBasicAuth()
  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(
    @Body()
    inputModel: QuestionInputModel,
  ) {
    const { questionId } = await this.commandBus.execute(
      // @ts-ignore
      new CreateQuestionCommand(inputModel.body, inputModel.correctAnswers),
    );

    return this.questionsQueryRepository.getById(questionId);
  }

  @ApiBasicAuth()
  @Put(':id/publish')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updatePublishOfQuestion(
    @Param('id', new ParseUUIDPipe()) questionId: string,
    @Body() updateModel: QuestionPublishInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePublishQuestionCommand(questionId, updateModel.published),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }

  @ApiBasicAuth()
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateQuestion(
    @Param('id', new ParseUUIDPipe()) questionId: string,
    @Body() updateModel: QuestionInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdateQuestionCommand(
        questionId,
        updateModel.body,
        updateModel.correctAnswers!,
      ),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }
}
