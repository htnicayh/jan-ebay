import { Logger, ValidationError, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as compression from 'compression'
import helmet from 'helmet'
import { SERVICE_NAME, SERVICE_PREFIX } from './commons/constant'
import { RestrictionExceptionFilter } from './commons/exceptions/restriction-filter.exception'
import { AppModule } from './modules/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const logger = new Logger(SERVICE_NAME)
    
    app.use(helmet())
    app.use(compression())
    app.setGlobalPrefix(SERVICE_PREFIX)

    app.enableCors({
      origin: true,
      methods: process.env.CORS_METHOD,
      credentials: true
    })

    app.useGlobalFilters(new RestrictionExceptionFilter())
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => errors[0]
    }))

    const options = new DocumentBuilder()
      .setTitle('Ebay APIs')
      .setDescription('The ebay APIs description')
      .setVersion('1.0.0')
      .addTag('Ebay')
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('apis', app, document)

    await app.listen(parseInt(process.env.PORT, 10))

    logger.log(`Application is running on: ${await app.getUrl()}`)
}

bootstrap()
