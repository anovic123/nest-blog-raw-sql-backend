import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityController } from './api/security.controller';

import { SecurityService } from './application/security.service';
import { JwtService } from '../../core/adapters/jwt-service';

import { SecurityRepository } from './infra/security.repository';
import { SecurityTypeormQueryRepository } from './infra/securite-typeorm.query.repository';
import { SecurityTypeormRepository } from './infra/securite-typeorm.repository';
import { SecurityQueryRepository } from './infra/security.query.repository';

import { AuthDevice } from './domain/device.entity';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([ AuthDevice ])
  ],
  providers: [
    SecurityService,
    SecurityRepository,
    SecurityTypeormQueryRepository,
    SecurityTypeormRepository,
    JwtService
  ],
  controllers: [SecurityController],
  exports: [SecurityRepository, SecurityTypeormRepository]
})
export class SecurityModule {}