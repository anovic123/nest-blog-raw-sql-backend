import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "src/base/models/interlayer";
import { AnswerStatus } from "src/features/quiz/api/models/enums/answer-status";
import { GameStatus } from "src/features/quiz/api/models/enums/game-status";
import { PlayerStatus } from "src/features/quiz/api/models/enums/player-status";
import { AnswerViewModel } from "src/features/quiz/api/models/output/game/answer.view.model";
import { Answer } from "src/features/quiz/domain/answer.entity";
import { Game } from "src/features/quiz/domain/game.entity";
import { Player } from "src/features/quiz/domain/player.entity";
import { GameRepository } from "src/features/quiz/infra/game.repository";

export class CheckTheAnswersCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(CheckTheAnswersCommand)
export class CheckTheAnswersUseCase
  implements ICommandHandler<CheckTheAnswersCommand>
{
  constructor(private gameRepository: GameRepository) {}

  async execute(command: CheckTheAnswersCommand) {
    const activeGame = await this.gameRepository.findActiveGame({
      currentUserId: command.userId,
    });
    if (!activeGame) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'current user is not inside active pair',
        'game',
        403,
      );
      return errorNotice;
    }
    const currentPlayer =
      command.userId === activeGame.player_1.user.id
        ? activeGame.player_1
        : activeGame.player_2;

    const opponentPlayer =
      currentPlayer === activeGame.player_1
        ? activeGame.player_2
        : activeGame.player_1;
    const player = await this.gameRepository.findPlayerWithCountAnswers({
      playerId: currentPlayer.id,
    });

    if (player.answersCount === 5) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        ' user is in active pair but has already answered to all questions',
        'game',
        403,
      );
      return errorNotice;
    }

    const currentQuestion =
      await this.gameRepository.findCurrentQuestionForGame({
        gameId: activeGame.id,
        ordinalNumber: player.answersCount,
      });
    const statusAnswer = currentQuestion.answers.includes(command.answer)
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;
    if (statusAnswer === AnswerStatus.Correct) {
      await this.gameRepository.increaseScoreForPlayer({ playerId: player.id });
    }

    const createdAnswer = await this.createAnswerForPlayer(
      player.id,
      currentQuestion.questionId,
      statusAnswer,
      command.answer,
    );

    if (player.answersCount < 4) {
      return new InterlayerNotice(
        this.createViewModel(
          currentQuestion.questionId,
          statusAnswer,
          createdAnswer.createdAt,
        ),
      );
    }

    const opponentPlayerWithCountAnswers =
      await this.gameRepository.findPlayerWithCountAnswers({
        playerId: opponentPlayer.id,
      });

    if (opponentPlayerWithCountAnswers.answersCount < 5) {
      return new InterlayerNotice(
        this.createViewModel(
          currentQuestion.questionId,
          statusAnswer,
          createdAnswer.createdAt,
        ),
      );
    }

    await this.calculatingTheBonus({
      currentPlayer: currentPlayer,
      opponentPlayer: opponentPlayer,
      gameId: activeGame.id,
      questionId: currentQuestion.questionId,
    });

    await this.gameRepository.finishGame(activeGame.id);

    return new InterlayerNotice(
      this.createViewModel(
        currentQuestion.questionId,
        statusAnswer,
        createdAnswer.createdAt,
      ),
    );
  }

  async createAnswerForPlayer(
    playerId: string,
    questionId: string,
    statusAnswer: AnswerStatus,
    playerAnswer: string,
  ) {
    const answer = Answer.create(
      playerId,
      questionId,
      statusAnswer,
      playerAnswer,
    );
    return this.gameRepository.createAnswer(answer);
  }

  createViewModel(
    questionId: string,
    answerStatus: AnswerStatus,
    addedAt: Date,
  ): AnswerViewModel {
    return {
      questionId: questionId,
      answerStatus: answerStatus,
      addedAt: addedAt.toISOString(),
    };
  }

  private async calculatingTheBonus(param: {
    currentPlayer: Player;
    opponentPlayer: Player;
    gameId: string;
    questionId: string;
  }) {
    const result = await this.gameRepository.getBonus({
      currentPlayerId: param.currentPlayer.id,
      opponentId: param.opponentPlayer.id,
      gameId: param.gameId,
      questionId: param.questionId,
    });

    if (result.bonusOfPlayer1 && param.currentPlayer.score > 0) {
      await this.gameRepository.increaseScoreForPlayer({
        playerId: param.currentPlayer.id,
      });
    }
    if (result.bonusOfPlayer2 && param.opponentPlayer.score > 0) {
      await this.gameRepository.increaseScoreForPlayer({
        playerId: param.opponentPlayer.id,
      });
    }
    const player1IsWinner =
      result.bonusOfPlayer1 + param.currentPlayer.score >
      result.bonusOfPlayer2 + param.opponentPlayer.score;
    const player2IsWinner =
      result.bonusOfPlayer2 + param.opponentPlayer.score >
      result.bonusOfPlayer1 + param.currentPlayer.score;
    const gameIsDraw =
      result.bonusOfPlayer2 + param.opponentPlayer.score ===
      result.bonusOfPlayer1 + param.currentPlayer.score;

    await this.gameRepository.updatePlayerStatus({
      playerId: param.currentPlayer.id,
      playerStatus: player1IsWinner
        ? PlayerStatus.Winner
        : gameIsDraw
          ? PlayerStatus.Draw
          : PlayerStatus.Loser,
    });

    await this.gameRepository.updatePlayerStatus({
      playerId: param.opponentPlayer.id,
      playerStatus: player2IsWinner
        ? PlayerStatus.Winner
        : gameIsDraw
          ? PlayerStatus.Draw
          : PlayerStatus.Loser,
    });
  }
}