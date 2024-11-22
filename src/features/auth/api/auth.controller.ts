import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

import { AuthGuard } from '../../../core/guards/auth.guard';
import { RefreshTokenGuard } from '../../../core/guards/refresh-token.guard';

import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { BodyLoginModel } from './models/input/body-login.input.model';
import { EmailResendingModel } from './models/input/email-resending.input.model';
import { NewPasswordInputModel } from './models/input/new-password.input.model';
import { CodeInputModel } from './models/input/code.input.model';
import { ErrorResponseDto } from 'src/base/models/errors-messages.base.model';
import { AccessToken } from './models/input/access-token.model';

import { ResendCodeCommand } from '../application/use-cases/resend-code.use-case';
import { CreateUserCommand } from '../application/use-cases/create-users.use-case';
import { NewPasswordCommand } from '../application/use-cases/new-password.use-case';
import { GetUserInfoQuery } from '../application/use-cases/user-info.query.use-case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { LogoutUserCommand } from '../application/use-cases/logout-user.use-case';

import { AuthService } from '../application/auth.service';

import { RequestWithUser } from '../../../base/types/request';

import { CreateSessionCommand } from '../application/use-cases/create-session';

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
  @ApiResponse({ status: 200, description: 'Success', type: AccessToken })
  @ApiResponse({ status: 400, description: 'Validation', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: '5 attempts from one IP-address during 10 seconds' })
  @ApiOperation({
    summary: 'Log in a user',
    description: 'Logs in a user with their credentials and returns access and refresh tokens.',
  })
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

  @SkipThrottle()
  @ApiSecurity('refreshToken')
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Generate new pair of access and refresh tokens',
  })
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
  @ApiSecurity('refreshToken')
  @ApiResponse({ status: 204, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Send correct refreshToken that will be revoked',
  })
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
  @ApiResponse({ status: 204, description: 'Success' })
  @ApiResponse({ status: 400, description: 'If the inputModel has incorrect value', type: ErrorResponseDto })
  @ApiResponse({ status: 429, description: '5 attempts from one IP-address during 10 seconds' })
  @ApiOperation({
    summary: 'Password recovery via Email confirmation',
  })
  public async passwordRecovery(@Body() emailModel: EmailResendingModel) {
    const { email } = emailModel;
    return this.commandBus.execute(new PasswordRecoveryCommand(email));
  }

  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Success' })
  @ApiResponse({ status: 400, description: 'If the inputModel has incorrect value', type: ErrorResponseDto })
  @ApiResponse({ status: 429, description: '5 attempts from one IP-address during 10 seconds' })
  @ApiOperation({
    summary: 'Confirm Password recovery',
  })
  public async newPassword(@Body() newPasswordModel: NewPasswordInputModel) {
    return this.commandBus.execute(new NewPasswordCommand(newPasswordModel));
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Email was verified. Account was activated' })
  @ApiResponse({ status: 400, description: 'If the inputModel has incorrect value', type: ErrorResponseDto })
  @ApiResponse({ status: 429, description: '5 attempts from one IP-address during 10 seconds' })
  @ApiOperation({
    summary: 'Confirm registration',
  })
  public async registrationConfirmation(@Body() codeBody: CodeInputModel) {
    return this.commandBus.execute(new ConfirmEmailCommand(codeBody.code));
  }

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Email with confirmation code will be send to passed email address' })
  @ApiResponse({ status: 400, description: 'If the inputModel has incorrect value', type: ErrorResponseDto })
  @ApiResponse({ status: 429, description: '5 attempts from one IP-address during 10 seconds' })
  @ApiOperation({
    summary: 'Registration in the system',
  })
  public async registerUser(@Body() createModel: UserCreateModel) {
    return this.commandBus.execute(new CreateUserCommand(createModel));
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Success' })
  @ApiResponse({ status: 400, description: 'If the inputModel has incorrect value', type: ErrorResponseDto })
  @ApiResponse({ status: 429, description: '5 attempts from one IP-address during 10 seconds' })
  @ApiOperation({
    summary: 'Resend confirmation registration email',
  })
  public async registrationEmailResending(
    @Body() emailResendingModel: EmailResendingModel,
  ) {
    return this.commandBus.execute(new ResendCodeCommand(emailResendingModel));
  }

  @SkipThrottle()
  @UseGuards(AuthGuard)
  @Get('/me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Get information about current user',
  })
  public async getMe(@Req() request: RequestWithUser) {
    const user = request['user']

    return this.queryBus.execute(new GetUserInfoQuery(user.userId));
  }
}