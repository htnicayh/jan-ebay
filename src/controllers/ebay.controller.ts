import { Controller, Get } from '@nestjs/common';

@Controller('/ebay')
export class EbayController {
    @Get('/')
    search() {
        return 'Search engine'
    }
}