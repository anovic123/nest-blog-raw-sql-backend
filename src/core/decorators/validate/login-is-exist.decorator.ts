import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UsersTypeormRepository } from 'src/features/users/infra/users-typeorm.repository';

@ValidatorConstraint({ name: 'LoginIsExist', async: true })
@Injectable()
export class LoginIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersTypeormRepository) {}
  async validate(value: any) {
    const loginIsExist = await this.usersRepository.loginIsExist(value);
    return !loginIsExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Login ${validationArguments?.value} already exist`;
  }
}

export function LoginIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: LoginIsExistConstraint,
    });
  };
}