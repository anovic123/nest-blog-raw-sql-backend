import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  constructor() {
  }

  async generateSalt() {
    return bcrypt.genSalt(10)
  }

  async generateHash(password: string) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  }

  async compareHash(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash)
  }
}