import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggingMiddleware } from 'src/middlewares/logging.middleware'
import { TimingMiddleware } from 'src/middlewares/timing.middleware'
import { EbayModule } from './ebay.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EbayModule,
    HttpModule,
    // RedisConnectionModule,
    // RabbitMQModule,
    // DatabaseModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware, TimingMiddleware)
      .forRoutes('ebay-us')
  }
}
