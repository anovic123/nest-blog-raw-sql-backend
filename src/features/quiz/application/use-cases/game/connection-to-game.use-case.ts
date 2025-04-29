import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "src/base/models/interlayer";

import { Game } from "src/features/quiz/domain/game.entity";
import { GameQuestion } from "src/features/quiz/domain/game.question.entity";
import { Player } from "src/features/quiz/domain/player.entity";
import { Question } from "src/features/quiz/domain/question.entity";

import { GameQueryRepository } from "src/features/quiz/infra/game.query-repository";

import { GameRepository } from "src/features/quiz/infra/game.repository";
import { QuestionsRepository } from "src/features/quiz/infra/questions.repository";

export class ConnectionToGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionToGameCommand)
export class ConnectionToGameUseCase
  implements ICommandHandler<ConnectionToGameCommand>
{
  constructor(
    private gameRepository: GameRepository,
    private questionRepository: QuestionsRepository,
    private gameQueryRepository: GameQueryRepository,
  ) {}
  async execute(
    command: ConnectionToGameCommand,
  ): Promise<InterlayerNotice<string | null>> {
    const activeGame = await this.gameRepository.findActiveGame({
      currentUserId: command.userId,
    });
    if (activeGame) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user is already participating in active pair',
        'game',
        403,
      );
      return errorNotice;
    }
    const gamePendingSecondPlayer = await this.gameRepository.findPendingGame();

    if (!gamePendingSecondPlayer) {
      return this.createNewGame(command.userId);
    }

    if (gamePendingSecondPlayer.userForPlayer1 === command.userId) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user is already in the pending game',
        'game',
        403,
      );

      return errorNotice;
    }

    return this.fixPairForGame(command.userId, gamePendingSecondPlayer.id);
  }
  async createNewGame(userId: string): Promise<InterlayerNotice<string>> {
    const newPlayer = Player.create(userId);
    const createdPlayer = await this.gameRepository.savePlayer(newPlayer);
    const pendingGame = Game.createPendingGame(createdPlayer.id);
    const createdGame = await this.gameRepository.saveGame(pendingGame);
    const createdGameForView =
      await this.gameQueryRepository.findGameWithLoginUser(createdGame.id);

    // @ts-ignore
    return new InterlayerNotice(createdGameForView.id);
  }
  async fixPairForGame(
    userId: string,
    currentGameId: string,
  ): Promise<InterlayerNotice<string>> {

    const newPlayer = Player.create(userId);
    const createdSecondPlayer = await this.gameRepository.savePlayer(newPlayer);


    await this.gameRepository.addSecondUserAndActiveTheGame({
      currentGameId: currentGameId,
      playerId: createdSecondPlayer.id,
    });

    const activeGame = await this.gameRepository.findGameById({
      id: currentGameId,
    });

    const activeGameForView =

    // @ts-ignore
      await this.gameQueryRepository.findGameWithLoginUser(activeGame.id);
    const fiveRandomQuestions: Question[] =
      await this.questionRepository.getFiveRandomPublishQuestions();

    const arrayForQuestion = fiveRandomQuestions.map((q) =>
          // @ts-ignore
      GameQuestion.create(activeGame.id, q.id),
    );

    await this.gameRepository.saveQuestionsForGame(arrayForQuestion);

        // @ts-ignore
    return new InterlayerNotice(activeGameForView.id);
  }
}