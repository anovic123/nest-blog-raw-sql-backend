import { Injectable } from '@nestjs/common';
import { TestingRepository } from '../infra/testing.repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly testingRepository: TestingRepository
  ) {}

  public async deleteAll(): Promise<boolean> {
    return this.testingRepository.deleteAll()
  }
}