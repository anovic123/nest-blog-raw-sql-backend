import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { CreateUserCommand } from '../application/use-cases/create-users.use-case';
import { BodyLoginModel } from './models/input/body-login.input.model';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RequestWithUser } from '../../../base/types/request';
import { AuthService } from '../application/auth.service';
import { GetUserInfoQuery } from '../application/use-cases/user-info.query.use-case';
import { EmailResendingModel } from './models/input/email-resending.input.model';
import { ResendCodeCommand } from '../application/use-cases/resend-code.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { NewPasswordInputModel } from './models/input/new-password.input.model';
import { NewPasswordCommand } from '../application/use-cases/new-password.use-case';
import { CodeInputModel } from './models/input/code.input.model';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import { CreateSessionCommand } from '../application/use-cases/create-session';
import { RefreshTokenGuard } from '../../../core/guards/refresh-token.guard';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { LogoutUserCommand } from '../application/use-cases/logout-user.use-case';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Body() bodyLoginEmail: BodyLoginModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const { loginOrEmail, password } = bodyLoginEmail;
    const user = await this.authService.checkCredentials(
      loginOrEmail,
      password,
    );

    const newDeviceRes = await this.commandBus.execute(
      new CreateSessionCommand(
        user.id,
        req.ip! || '0.0.0.0',
        req.headers['user-agent'] || 'Unknown',
      ),
    );

    const { accessToken, refreshToken } = newDeviceRes;

    res
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .header('Authorization', accessToken)
      .send({ accessToken });
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async refreshToken(@Res() res: Response, @Req() req: RequestWithUser) {
    const requestRefreshToken = req.cookies['refreshToken'];

    const result = await this.commandBus.execute(
      new RefreshTokenCommand(requestRefreshToken),
    );

    const { accessToken, refreshToken } = result;

    res
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .status(200)
      .json({ accessToken });
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logoutUser(
    @Res() response: Response,
    @Req() request: RequestWithUser,
  ) {
    const requestRefreshToken = request.cookies['refreshToken'];
    const res = await this.commandBus.execute(
      new LogoutUserCommand(requestRefreshToken),
    );

    if (res) {
      response.clearCookie('refreshToken');
      response.sendStatus(204);
    }
  }

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

    return this.queryBus.execute(new GetUserInfoQuery(user.userId));
  }
}