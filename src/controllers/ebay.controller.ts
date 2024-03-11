import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Logger, Param, Query, Req, ValidationPipe } from '@nestjs/common'
import { Request } from 'express'
import { Response } from 'src/commons/responses/response'
import { EbaySearchDto } from 'src/dtos/ebay-search.dto'
import { EbayService } from 'src/services/ebay.service'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { EbaySearchResponse } from 'src/dtos/ebay-search-response.dto'
import { EbayProductResponse } from 'src/dtos/ebay-product-response.dto'
import { EbayRelatesResponse } from 'src/dtos/ebay-relates-response.dto'

@ApiTags('Ebay US')
@Controller('/ebay-us')
export class EbayController {
    private readonly logger: Logger = new Logger(EbayController.name)

    constructor(
        private readonly ebayService: EbayService
    ) {}

    @Get('/search')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Search ebay product with keywords' })
    @ApiResponse({ status: 200, description: 'Search ebay with keywords successfully', type: EbaySearchResponse })
    async searchEbay(@Query(ValidationPipe) query: EbaySearchDto) {
        try {
            const cloneParams = JSON.parse(JSON.stringify(query))
            cloneParams.page = cloneParams.page ? cloneParams.page * 1 : 1
            cloneParams.size = cloneParams.size ? cloneParams.size * 1 : 20

            return new Response(
                1,
                await this.ebayService.searchEbay(cloneParams),
                'Search ebay successfully !'
            )
        } catch (e) {
            if (e instanceof BadRequestException) {
                return new Response(0, {}, e?.message)
            }

            return new Response(0, {})
        }
    }

    @Get('/item/:item_id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Search ebay product details with item_id' })
    @ApiResponse({ status: 200, description: 'Search ebay product details successfully', type: EbayProductResponse })
    async productDetails(@Param('item_id') itemId: string) {
        try {
            return new Response(
                1,
                await this.ebayService.productDetails(itemId),
                'Get product details successfully !'
            )
        } catch (e) {
            if (e instanceof BadRequestException) {
                return new Response(0, {}, e?.message)
            }

            return new Response(0, {})
        }
    }

    @Get('/relates/:item_id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Search related products with item_id' })
    @ApiResponse({ status: 200, description: 'Search related products successfully', type: EbayRelatesResponse })
    async relatedProduct(@Param('item_id') itemId: string, @Query() query: any) {
        try {
            return new Response(
                1,
                await this.ebayService.relatesProduct(itemId, Number(query?.size) || 20),
                'Get related product successfully !'
            )
        } catch (e) {
            if (e instanceof BadRequestException) {
                return new Response(0, [], e?.message)
            }

            return new Response(0, [])
        }
    }
}