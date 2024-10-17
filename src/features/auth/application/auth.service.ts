import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CryptoService } from '../../../core/adapters/crypto-service';
import { UsersQueryRepository } from '../../users/infra/users-query.repository';
import { User } from '../../users/domain/users.entity';

@Injectable()
export class AuthService {
  constructor(
      private readonly cryptoService: CryptoService,
      private readonly usersQueryRepository: UsersQueryRepository
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