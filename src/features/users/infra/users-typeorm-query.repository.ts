import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../domain/users.entity";
import { Repository } from "typeorm";
import { PaginationOutput, PaginationWithSearchLoginAndEmailTerm } from "src/base/models/pagination.base.model";
import { UserOutputModel } from "src/features/auth/api/models/output/user.output.model";


@Injectable()
export class UserTypeormQueryRepository {
  constructor(
    @InjectRepository(User) 
    protected readonly userRepository: Repository<User>
  ) {}

  public async getAllUsers(
    pagination: PaginationWithSearchLoginAndEmailTerm
  ): Promise<PaginationOutput<UserOutputModel>> {
    const {
      pageNumber,
      pageSize,
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
    } = pagination;

    const queryBuilder = this.userRepository.createQueryBuilder('u')

    queryBuilder.select(['u.id', 'u.login', 'u.email', 'u.createdAt'])

    if (searchEmailTerm && searchLoginTerm) {
      queryBuilder.andWhere(
        '(u.email ILIKE :email OR u.login ILIKE :login)',
        { email: `%${searchEmailTerm}%`, login: `%${searchLoginTerm}%` }
      );
    } else if (searchEmailTerm) {
      queryBuilder.andWhere('u.email ILIKE :email', { email: `%${searchEmailTerm}%` });
    } else if (searchLoginTerm) {
      queryBuilder.andWhere('u.login ILIKE :login', { login: `%${searchLoginTerm}%` });
    }
    
    queryBuilder.orderBy(`u.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')

    queryBuilder.skip((pageNumber - 1) * pageSize).take(pageSize)

    const [ users, totalCount ] = await queryBuilder.getManyAndCount()

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: users
    }

    return paginationResult
  }

  public async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const user = 
      await this.userRepository
      .createQueryBuilder('u')
      .where("u.login = :login OR u.email = :email", { login: loginOrEmail, email: loginOrEmail })
      .getOne()


      return user || null;  
  }


  public async findUserByConfirmationCode(code: string): Promise<User | null> {
    const user = await 
      this.userRepository.createQueryBuilder('u')
      .where("u.confirmationCode = :confirmationCode", {
        confirmationCode: code
      }).getOne()

    return user || null
  }
} 