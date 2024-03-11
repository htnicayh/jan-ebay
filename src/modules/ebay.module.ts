import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { EbayController } from 'src/controllers/ebay.controller'
import { EbayService } from 'src/services/ebay.service'

@Module({
    imports: [HttpModule],
    controllers: [EbayController],
    providers: [EbayService]
})
export class EbayModule {}