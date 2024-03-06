import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import helmet from 'helmet';
import { NEST_NAME, SERVICE_NAME } from './commons/constant';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(NEST_NAME);
  
  app.use(helmet());
  app.use(compression());

  app.setGlobalPrefix(SERVICE_NAME);
  app.enableCors({
    origin: true,
    methods: process.env.CORS_METHOD,
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => errors[0]
  }));

  await app.listen(parseInt(process.env.PORT, 10));

  logger.log(`Search engine is running on: ${process.env.PORT}`);
}

bootstrap();
