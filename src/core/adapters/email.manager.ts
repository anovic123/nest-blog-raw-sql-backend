import { Injectable } from '@nestjs/common';

import { EmailAdapter } from './email.adapter';

class EmailDto {
  email: string;
  confirmationCode: string;
}

@Injectable()
export class EmailsManager {
  constructor(private emailAdapter: EmailAdapter) {}

  public async sendConfirmationMessage({ email, confirmationCode }: EmailDto) {
    await this.emailAdapter.sendEmail(
      email,
      'confirmation code',
      confirmationCode,
    );
  }
  public async sendRecoveryMessage({ email, confirmationCode }: EmailDto) {
    return await this.emailAdapter.sendRecoveryEmail(
      email,
      'recoveryMessage',
      confirmationCode,
    );
  }
}