import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EbayModule } from './ebay.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EbayModule,
  ]
})
export class AppModule {}
