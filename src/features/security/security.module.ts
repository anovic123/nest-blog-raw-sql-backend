import { Module } from '@nestjs/common';
import { SecurityController } from './api/security.controller';

import { SecurityService } from './application/security.service';
import { JwtService } from '../../core/adapters/jwt-service';

import { SecurityRepository } from './infra/security.repository';
import { SecurityQueryRepository } from './infra/security.query.repository';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
  ],
  providers: [
    SecurityService,
    SecurityRepository,
    SecurityQueryRepository,
    JwtService
  ],
  controllers: [SecurityController],
  exports: [SecurityRepository]
})
export class SecurityModule {}