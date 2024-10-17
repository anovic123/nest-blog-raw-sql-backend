import { Global, Module } from '@nestjs/common';

import { CryptoService } from './crypto-service';
import { EmailsManager } from './email.manager';
import { EmailAdapter } from './email.adapter';
import { JwtService } from './jwt-service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [CryptoService, EmailsManager, EmailAdapter, JwtService],
  exports: [CryptoService, EmailsManager, EmailAdapter, JwtService],
})
export class AdaptersModule {}
