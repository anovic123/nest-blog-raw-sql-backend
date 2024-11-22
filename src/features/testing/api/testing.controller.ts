import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from '../application/testing.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('testing')
export class TestingController {
  constructor(
    private readonly testingService: TestingService
  ) {}

  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'All data is deleted' })
  @ApiOperation({
    summary: 'Delete all data',
  })
  public async deleteAll() {
    return this.testingService.deleteAll();
  }
}
