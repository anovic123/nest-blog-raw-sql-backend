import { DevicesSessionViewModel } from "./models/output.model";
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, getSchemaPath } from "@nestjs/swagger";

import { RefreshTokenGuard } from 'src/core/guards/refresh-token.guard';

import { SecurityService } from '../application/security.service';

import { RequestWithUser } from 'src/base/types/request';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Get('/devices')
  @ApiSecurity('refreshToken')
  @ApiResponse({ status: 200, description: 'Success', type: DevicesSessionViewModel})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Returns all devices with active sessions for current user',
  })
  public async getAllDevices(@Req() request: RequestWithUser) {
    return this.securityService.getAllDevicesSessions(
      request.userId!,
    );
  }

  // delete all sessions, but not current
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSecurity('refreshToken')
  @ApiResponse({ status: 204, description: 'No Content', type: DevicesSessionViewModel})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Terminate all other (exclude current) devices sessions',
  })
  public async deleteAllOtherDevicesSessions(@Req() req: RequestWithUser) {
    return this.securityService.deleteAllSessions(req.userId!, req.deviceId!);
  }

  @UseGuards(RefreshTokenGuard)
  @Delete('/devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSecurity('refreshToken')
  @ApiResponse({ status: 204, description: 'No Content', type: DevicesSessionViewModel})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'If try to delete the deviceId of other user' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiOperation({
    summary: 'Terminate specified device session',
  })
  public async deleteSessionByDeviceId(
    @Param('deviceId') deviceId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.securityService.deleteSessionById(request.userId!, deviceId);
  }
}