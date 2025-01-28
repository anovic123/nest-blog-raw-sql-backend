import { ForbiddenException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { randomUUID } from "node:crypto";

import { QuizGameTypeormRepository } from "../../infra/quiz-game-typeorm.repository";
import { QuizPlayerTypeormRepository } from "../../infra/quiz-player-typeorm.repository";
import { UsersTypeormRepository } from "src/features/users/infra/users-typeorm.repository";
import { QuizTypeormRepository } from "../../infra/quiz-typeorm.repository";

import { CreatePlayerDto } from "../../api/models/dto/create-player.dto";
import { AddQuestionsToGameDto } from "../../api/models/dto/add-questions-to-game.dto";
import { AddPlayerDto } from "../../api/models/dto/add-player.dto";
import { CreateGameDto } from "../../api/models/dto/create-game.dto";
import { GameStatus } from "../../domain/quiz-games.entity";

export class CreateGameCommand {
  constructor(
    public readonly userId: string
  ) {}
}

@CommandHandler(CreateGameCommand)
export class CreateGameUseCase implements ICommandHandler<CreateGameCommand> {
  constructor(
    private readonly quizGameTypeormRepository: QuizGameTypeormRepository,
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private readonly quizTypeormRepository: QuizTypeormRepository,
    private readonly quizPlayerTypeormRepository: QuizPlayerTypeormRepository
  ) {}

  async execute(command: CreateGameCommand): Promise<any> {
      const { userId } = command;

      let newGame;

      const activeGame = await this.quizGameTypeormRepository.getActiveGame(userId)

      if (activeGame) {
        throw new ForbiddenException('Current user is already participating in active pair');
      }
      
      const pendingGame = await this.quizGameTypeormRepository.getPendingGame()

      const user = await this.usersTypeormRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundException('user not found');
      }

      const playerDTO: CreatePlayerDto = {
        id: randomUUID(),
        userId: user?.id,
        login: user?.login,
        gameId: pendingGame?.id ? pendingGame?.id : '' 
      }

      await this.quizPlayerTypeormRepository.createPlayer(playerDTO)

      if (pendingGame) {
        const playerIds = await this.quizPlayerTypeormRepository.getPlayersIds(userId)

        if (playerIds?.includes(pendingGame?.firstPlayerId)) {
          throw new ForbiddenException();
        }

        const questionsId = await this.quizTypeormRepository.getFiveQuestionsId()

        const questionsDto: AddQuestionsToGameDto = {
          gameId: pendingGame.id,
          questionsId: questionsId.map((question) => question.id)
        }

        await this.quizTypeormRepository.createFiveGameQuestions(questionsDto)

        const dto: AddPlayerDto = {
          id: pendingGame.id,
          secondPlayerId: playerDTO.id
        }

        await this.quizGameTypeormRepository.addPlayerToGame(dto)

        newGame = await this.quizGameTypeormRepository.getActiveGame(userId)
      }

      if (!newGame) {
        const dto: CreateGameDto = {
          id: randomUUID(),
          status: GameStatus.Pending,
          pairCreatedData: new Date(),
          firstPlayerId: playerDTO.id
        }
        console.log("🚀 ~ CreateGameUseCase ~ execute ~ dto:", dto)

        await this.quizPlayerTypeormRepository.updatePlayerGameId(playerDTO.id, dto.id)

        newGame = await this.quizGameTypeormRepository.createGame(dto)
      }

      if (!newGame) {
        throw new InternalServerErrorException('Something went wrong')
      }

      return newGame;
  }
}