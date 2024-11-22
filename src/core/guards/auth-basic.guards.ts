import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ConfigurationType } from 'src/settings/configuration';
import { AuthGuard } from './auth.guard';

export const fromUTF8ToBase64 = (code: string) => {
  const buff2 = Buffer.from(code, 'utf8');
  const codedAuth = buff2.toString('base64');
  return codedAuth;
};

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService<ConfigurationType, true>) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException();
    }

    const base64Credentials = authHeader.slice(6).trim();

    const basicSettings = this.configService.get('basicSettings', {
      infer: true,
    });
    const validBase64Credentials = fromUTF8ToBase64(
      `${basicSettings.ADMIN_LOGIN}:${basicSettings.ADMIN_PASSWORD}`,
    );
    if (base64Credentials !== validBase64Credentials) {
      throw new UnauthorizedException();
    }

    return true;
  }
}