import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron } from '@nestjs/schedule';

import { FinishExpiredGamesCommand } from '../use-cases/game/finish-expired-games.use-case';

@Injectable()
export class GameExpirationCron {
  constructor(private readonly commandBus: CommandBus) {}

  @Cron('*/11 * * * * *')
  async handleExpiredGames() {
    await this.commandBus.execute(new FinishExpiredGamesCommand());
  }
}