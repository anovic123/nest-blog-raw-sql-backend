import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { CreateUserCommand } from './use-cases/create-users.use-case';
import { BodyLoginModel } from './models/input/body-login.input.model';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RequestWithUser } from '../../../base/types/request';
import { AuthService } from '../application/auth.service';
import { GetUserInfoQuery } from './use-cases/user-info.query.use-case';
import { EmailResendingModel } from './models/input/email-resending.input.model';
import { ResendCodeCommand } from './use-cases/resend-code.use-case';
import { PasswordRecoveryCommand } from './use-cases/password-recovery.use-case';
import { NewPasswordInputModel } from './models/input/new-password.input.model';
import { NewPasswordCommand } from './use-cases/new-password.use-case';
import { CodeInputModel } from './models/input/code.input.model';
import { ConfirmEmailCommand } from './use-cases/confirm-email.use-case';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  // @Post('/login')
  // @HttpCode(HttpStatus.OK)
  // public async loginUser(
  //   @Body() bodyLoginEmail: BodyLoginModel,
  //   @Res({ passthrough: true }) res: Response,
  //   @Req() req: any
  // ) {
  //   const { loginOrEmail, password } = bodyLoginEmail
  //
  //   const
  // }

  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async passwordRecovery(@Body() emailModel: EmailResendingModel) {
    const { email } = emailModel;
    return this.commandBus.execute(new PasswordRecoveryCommand(email));
  }

  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async newPassword(@Body() newPasswordModel: NewPasswordInputModel) {
    return this.commandBus.execute(new NewPasswordCommand(newPasswordModel));
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registrationConfirmation(@Body() codeBody: CodeInputModel) {
    return this.commandBus.execute(new ConfirmEmailCommand(codeBody.code));
  }

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registerUser(@Body() createModel: UserCreateModel) {
    return this.commandBus.execute(new CreateUserCommand(createModel));
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registrationEmailResending(
    @Body() emailResendingModel: EmailResendingModel,
  ) {
    return this.commandBus.execute(new ResendCodeCommand(emailResendingModel));
  }

  @SkipThrottle()
  @UseGuards(AuthGuard)
  @Get('/me')
  public async getMe(@Req() request: RequestWithUser) {
    const user = request['user']

    return this.queryBus.execute(new GetUserInfoQuery(+user.userId));
  }
}