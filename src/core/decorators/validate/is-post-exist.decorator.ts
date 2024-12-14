import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { PostsTypeormRepository } from 'src/features/bloggers/posts/infra/posts-typeorm.repository';

@ValidatorConstraint({ name: 'PostIsExist', async: true })
@Injectable()
export class PostIsExistConstraint implements ValidatorConstraintInterface {
    constructor(private readonly postRepository: PostsTypeormRepository) { }
    async validate(value: any, args: ValidationArguments) {
    const postIsExist = await this.postRepository.isPostExisted(value);
    return postIsExist;
}

    defaultMessage(validationArguments?: ValidationArguments): string {
    return `BlogId ${validationArguments?.value} not exist`;
    }
}

export function BlogIsExist(
    property?: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
    registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [property],
        validator: PostIsExistConstraint,
    });
    };
}