import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { add } from 'date-fns';

import { User } from "../domain/users.entity";

@Injectable()
export class UsersTypeormRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  public async emailIsExist(email: User['email']): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { email }
    })

    return count > 0
  }

  public async loginIsExist(login: User['login']): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { login }
    })

    return count > 0
  }

  public async deleteUser(id: User['id']): Promise<boolean> {
    const res = await this.userRepository.softDelete(id);
    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }
  
  public async updateUserPasswordHash(
    id: string,
    newPasswordHash: string
  ): Promise<boolean> {
    const res = await this.userRepository.createQueryBuilder("u").update(User).set({
      passwordHash: newPasswordHash
    }).where("id = :id", { id })
    .execute()

    return res.affected !== undefined && res.affected > 0;
  }

  public async updateConfirmation(id: User['id']): Promise<boolean> {
    const res = await 
      this.userRepository
      .createQueryBuilder("u")
      .update(User)
      .set({
        isConfirmed: true
      })
      .where("id = :id", { id })
      .execute()

    return res.affected !== undefined && res.affected > 0
  }

  public async updateUserConfirmationCode(
    id: User['id'],
    code: string
  ): Promise<boolean> {
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });
  
    const res = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        confirmationCode: code,
        expirationDate,
      })
      .where("id = :id", { id })
      .execute();
  
    return res.affected !== undefined && res.affected > 0;
  }  
  
  public async findUserById(id: User['id']): Promise<User | null> {
    const user = await 
      this.userRepository
      .createQueryBuilder("u")
      .where("u.id = :id", { id })
      .getOne()

    return user || null
  }
}