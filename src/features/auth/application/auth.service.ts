import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CryptoService } from '@core/adapters/crypto-service';

import { User } from 'src/features/users/domain/users.entity';

import { UserTypeormQueryRepository } from 'src/features/users/infra/users-typeorm-query.repository';

@Injectable()
export class AuthService {
  constructor(
      private readonly cryptoService: CryptoService,
      private readonly usersQueryRepository: UserTypeormQueryRepository
  ) {}

  public async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<User> {
    const user =
      await this.usersQueryRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) {
      throw new HttpException('User is not founded', HttpStatus.UNAUTHORIZED);
    }

    const isHashedEquals = await this.cryptoService.compareHash(
      password,
      user.passwordHash,
    );

    if (!isHashedEquals) {
      throw new HttpException('Password is wrong', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}