import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { PlayerStatus } from "src/features/quiz/api/models/enums/player-status";

import { GameRepository } from "src/features/quiz/infra/game.repository";

export class FinishExpiredGamesCommand {}

@CommandHandler(FinishExpiredGamesCommand)
export class FinishExpiredGamesUseCase
  implements ICommandHandler<FinishExpiredGamesCommand>
{
  constructor(private gameRepository: GameRepository) {}

  async execute(command: FinishExpiredGamesCommand) {
    const expiredGames = await this.gameRepository.findExpiredGame();
    for (const gameForFinish of expiredGames) {
      await this.gameRepository.finishGame(gameForFinish.gameId);
      if (gameForFinish.count_pl1 === 5) {
        await this.gameRepository.increaseScoreForPlayer({
          playerId: gameForFinish.player1,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player1,
          playerStatus: PlayerStatus.Winner,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player2,
          playerStatus: PlayerStatus.Loser,
        });
      } else {
        await this.gameRepository.increaseScoreForPlayer({
          playerId: gameForFinish.player2,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player2,
          playerStatus: PlayerStatus.Winner,
        });
        await this.gameRepository.updatePlayerStatus({
          playerId: gameForFinish.player1,
          playerStatus: PlayerStatus.Loser,
        });
      }
    }
  }
}