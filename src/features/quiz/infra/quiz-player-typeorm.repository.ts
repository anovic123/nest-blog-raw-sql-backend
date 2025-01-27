import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";

import { QuizPlayer } from "../domain/quiz-player.entity";
import { CreatePlayerDto } from "../api/models/dto/create-player.dto";

@Injectable()
export class QuizPlayerTypeormRepository {
  constructor (
    @InjectRepository(QuizPlayer)
    private readonly quizPlayerTypeormRepository: Repository<QuizPlayer> 
  ) {}


  public async createPlayer(playerDto: CreatePlayerDto): Promise<InsertResult> {
    const newPlayer = await this.quizPlayerTypeormRepository.createQueryBuilder('p').insert().values({
      id: playerDto.id,
      userId: playerDto.userId,
      login: playerDto.login,
      gameId: playerDto.gameId
    }).execute()

    return newPlayer
  }

  public async getPlayersIds(userId: string): Promise<string[] | null> {
    const playerIds = await this.quizPlayerTypeormRepository.createQueryBuilder('p').select('p.id').where('p.userId = :userId', { userId }).getRawMany()

    return playerIds ? playerIds.map((player) => player.id) : null
  }

  public async updatePlayerGameId(id: string, gameId: string) {
    return this.quizPlayerTypeormRepository.createQueryBuilder('p').update().set({ gameId }).where('id = :id', { id }).execute()
  }
}
