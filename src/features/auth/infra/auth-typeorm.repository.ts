import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "src/features/users/domain/users.entity";

import { UserOutputModel } from "src/features/auth/api/models/output/user.output.model";

@Injectable()
export class AuthTypeormRepository {
  constructor (
    @InjectRepository(User)
    private readonly authRepository: Repository<User>
  ) {}

  public async createUser(user: User): Promise<UserOutputModel> {
    const result = await this.authRepository.save(user) 

    // const checkUser = await this.authRepository.createQueryBuilder('u').where('u.id = :id', { id: result.id }).getOne()

    // if (!checkUser) {
    //   throw new Error('User was not created')
    // }

    return this.outputModelUser(user)
  }

  public outputModelUser(user: User): UserOutputModel {
    return {
      id: user.id,
      createdAt: user.createdAt,
      email: user.email,
      login: user.login
    }
  }
}