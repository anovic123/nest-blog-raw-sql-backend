import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/features/users/domain/users.entity";
import { Repository } from "typeorm";
import { UserOutputModel } from "../api/models/output/user.output.model";

@Injectable()
export class AuthTypeormRepository {
  constructor (
    @InjectRepository(User)
    private readonly authRepository: Repository<User>
  ) {}

  public async createUser(user: Omit<User, 'isConfirmed'>): Promise<UserOutputModel> {
    const newUser = User.createUser(user)

    const result = await this.authRepository.save(newUser) 

    const checkUser = await this.authRepository.createQueryBuilder('u').where('u.id = :id', { id: result.id }).getOne()

    if (!checkUser) {
      throw new Error('User was not created')
    }

    return this.outputModelUser(newUser)
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