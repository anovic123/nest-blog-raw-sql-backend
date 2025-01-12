import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBasicAuth, ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";

import { BasicAuthGuard } from "@core/guards/auth-basic.guards";

import { SaQuizTypeormQueryRepository } from "../infra/sa-quiz-typeorm-query.repository";

import { PaginationOutput, PaginationQuestions, PaginationQuestionsQueryDto } from "src/base/models/pagination.base.model";

import { SortingPropertiesType } from "src/base/types/sorting-properties.type";

import { QuestionViewDto } from "./models/output/question.view-dto";
import { CreateQuestionDto } from "./models/dto/create-question.dto";
import { UpdateQuestionDto } from "./models/input/update-question.input-dto";
import { PublishQuestionDto } from "./models/input/publish-question.input-dto";

import { ErrorResponseDto } from "src/base/models/errors-messages.base.model";

import { CreateQuestionCommand } from "../application/admin-use-cases/create-question.use-case";
import { DeleteQuestionCommand } from "../application/admin-use-cases/delete-question.use-case";
import { UpdateQuestionCommand } from "../application/admin-use-cases/update-question.use-case";
import { PublishQuestionCommand } from "../application/admin-use-cases/publish-question.use-case";

export const QUIZ_QUESTIONS_SORTING_PROPERTIES: SortingPropertiesType<QuestionViewDto> = ['body', 'correctAnswers', 'createdAt', 'id', 'published', 'updatedAt']

@ApiTags("QuizQuestions")
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class QuizAdminController {
  constructor (
    private readonly quizTypeormQueryRepository: SaQuizTypeormQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @ApiExtraModels(PaginationOutput, QuestionViewDto)
  @ApiQuery({ name: "Pagination Query", type: PaginationQuestionsQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(PaginationOutput)
        },
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(QuestionViewDto) }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Unauthorized"
  })
  @Get()
  @ApiOperation({
    summary: "Returns all questions with pagination and filtering"
  })
  public async getQuizQuestions(@Query() query) {
    const pagination: PaginationQuestions = new PaginationQuestions(query, QUIZ_QUESTIONS_SORTING_PROPERTIES)
    return this.quizTypeormQueryRepository.getQuizQuestions(pagination)
  }

  @Post()
  @ApiOperation({
    summary: "Create question"
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created', type: QuestionViewDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'If the inputModel has incorrect values', type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  public async createQuizQuestion(@Body() body: CreateQuestionDto): Promise<QuestionViewDto> {
    return this.commandBus.execute(new CreateQuestionCommand(body))
  }

  @Delete('/:id')
  @ApiOperation({
    summary: "Delete question"
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  public async deleteQuizQuestion(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteQuestionCommand(id))
  }

  @Put('/:id')
  @ApiOperation({
    summary: "Update question"
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'If the inputModel has incorrect values or property "correctAnswers" are not passed but property "published" is true', type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  public async updateQuizQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto
  ) {
    return this.commandBus.execute(new UpdateQuestionCommand(id, body))
  }

  @Put('/:id')
  @ApiOperation({
    summary: "Publish/unpublish question"
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No Content' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'If the inputModel has incorrect values or specified question doesn\'\t have correct answers', type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  public async updateQuizQuestionStatus(
    @Param('id') id: string,
    @Body() body: PublishQuestionDto
  ) {
    return this.commandBus.execute(new PublishQuestionCommand(id, body))
  }
}