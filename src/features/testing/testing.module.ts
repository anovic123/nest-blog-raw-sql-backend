import { Module } from '@nestjs/common';

import { TestingController } from './api/testing.controller';

import { TestingService } from './application/testing.service';

import { TestingRepository } from './infra/testing.repository';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository]
})
export class TestingModule {}