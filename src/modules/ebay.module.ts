import { Module } from '@nestjs/common';
import { EbayController } from 'src/controllers/ebay.controller';
import { EbayService } from 'src/services/ebay.service';

@Module({
    controllers: [EbayController],
    providers: [EbayService]
})
export class EbayModule {}