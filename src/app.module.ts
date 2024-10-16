import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './settings/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env'
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
