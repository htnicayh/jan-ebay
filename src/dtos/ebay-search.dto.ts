import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class EbaySearchDto {
    @ApiProperty()
    @IsString()
    readonly keywords: string

    @ApiPropertyOptional({ description: 'all: 0|3 - auction: 2 - buynow: 1' })
    @IsOptional()
    @IsString()
    readonly fixed?: string

    @ApiPropertyOptional()
    @IsOptional()
    page?: string

    @ApiPropertyOptional()
    @IsOptional()
    size?: string
}