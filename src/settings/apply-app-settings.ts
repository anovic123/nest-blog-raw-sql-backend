/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from 'src/app.module';

import { HttpExceptionFilter } from '../core/exception-filters/http-exception-filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BLOGGER API')
    .addBearerAuth()
    .addBasicAuth()
    .setVersion('1.0')
    .build();
 
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Blogger Swagger',
  });
}

export const applyAppSettings = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  setAppPipes(app);

  setAppExceptionsFilters(app);

  app.use(cookieParser());
  swaggerSetup(app);
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors = [];

        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints as any);
          constraintKeys.forEach((cKey, index) => {
            if (index >= 1) return;
            const msg = e.constraints?.[cKey] as any;

            // @ts-ignore
            customErrors.push({ key: e.property, message: msg });
          });
        });

        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};