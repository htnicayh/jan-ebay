import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as moment from 'moment'
import { CURRENCY, DATE_FORMAT, DEFAULT_SORT, ENVIRONMENT, ITEM_TYPE, MAPPING_TABS, MAX_RESULTS, OUTPUT_SELECTOR } from 'src/commons/constant'
import { IEbaySearch } from 'src/commons/interfaces/ebay-search.interface'
import { Data, EbayProductResponse, Methods, Seller } from 'src/dtos/ebay-product-response.dto'
import { EbayRelatesResponse } from 'src/dtos/ebay-relates-response.dto'
import { EbaySearchResponse, Filter, Pagination, Results, Sorter } from 'src/dtos/ebay-search-response.dto'

@Injectable()
export class EbayService {
    private readonly logger = new Logger(EbayService.name)
    private clientID: string
    private clientSecret: string
    private ebayEndpoint: string

    private static readonly FIND_ITEMS_BY_KEYWORDS = 'findItemsByKeywords'
    private static readonly FIND_ITEMS_ADVANCED = 'findItemsAdvanced'
    private static readonly GET_SIMILAR_ITEMS = 'getSimilarItems'

    private static readonly MERCHANDISING_SERVICE = 'MerchandisingService'
    private static readonly FINDING_SERVICE = 'FindingService'

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {
        const ebayEnv = /^PRODUCTION$/.test(this.configService.get<string>('EBAY_ENVIRONMENT')) ? ENVIRONMENT.PRODUCTION : ENVIRONMENT.TEST

        this.clientID = this.configService.get<string>(`EBAY_CLIENT_ID_${ebayEnv}`)
        this.clientSecret = this.configService.get<string>(`EBAY_CLIENT_SECRET_${ebayEnv}`)
        this.ebayEndpoint = this.configService.get<string>(`EBAY_ENDPOINT_${ebayEnv}`)
    }

    async searchEbay(query: IEbaySearch): Promise<any> {
        try {
            const objSearchEbay = {
                service: EbayService.FINDING_SERVICE,
                operation: EbayService.FIND_ITEMS_ADVANCED,
                payload: {
                    'keywords': query.keywords,
                    'sortOrder': DEFAULT_SORT,
                    'descriptionSearch': true,
                    'paginationInput.pageNumber': query.page,
                    'paginationInput.entriesPerPage': query.size
                }
            } as any
            const fixed = query?.fixed ? query.fixed : '0'

            const response = new EbaySearchResponse()
            const buildURL = this.buildURIParams(objSearchEbay)
            const sendRequest = (await this.httpService.get(buildURL).toPromise())?.data?.findItemsAdvancedResponse || []

            if (Array.isArray(sendRequest) && sendRequest.length > 0) {
                const items: Results[] = []
                const paginationInstance = new Pagination()
                const objTabs = {
                    all: {
                        count: 0,
                        is_active: /(0|3)/.test(fixed)
                    },
                    auction: {
                        count: 0,
                        is_active: /2/.test(fixed)
                    },
                    buynow: {
                        count: 0,
                        is_active: /1/.test(fixed)
                    }
                }

                const objResponse = sendRequest[0] as any
                const pagination = objResponse?.paginationOutput?.[0] || {}

                const page = pagination?.pageNumber?.[0]
                const size = pagination?.entriesPerPage?.[0]
                const total = pagination?.totalEntries?.[0]

                paginationInstance.page = page ? page * 1 : 1
                paginationInstance.size = size ? size * 1 : 0
                paginationInstance.total = total ? total * 1 : 0

                response.pagination = paginationInstance

                if (!/^success$/i.test(objResponse?.ack?.[0])) {
                    response.success = false
                    response.results = items

                    return response
                }

                const listItems = objResponse?.searchResult?.[0]?.item || []
                if (Array.isArray(listItems) && listItems.length > 0) {
                    for (const item of listItems) {
                        const itemInstance = new Results()

                        const listing = item?.listingInfo?.[0] || {}
                        const selling = item?.sellingStatus?.[0] || {}
                        const shipping = item?.shippingInfo?.[0] || {}
                        const product = item?.productId?.[0]?.__value__
                        const listingType = listing?.listingType?.[0] || ''
                        const seller = item?.sellerInfo?.[0]?.sellerUserName?.[0] || ''
                        const returnsAccepted = /^true$/.test(item?.returnsAccepted?.[0]) ? true : false
                        const convertedPrice = selling?.convertedCurrentPrice?.[0]?.__value__ ? parseFloat((selling.convertedCurrentPrice)[0].__value__) : 0

                        let isFreeShipping = false
                        let isNewProduct = false
                        let priceForAuction = 0
                        let priceForBuynow = 0
                        let bidCount = 0

                        objTabs.all.count += 1

                        if (
                            /^(0|0.0)$/.test(shipping?.shippingServiceCost?.[0]?.__value__) ||
                            /^free/i.test(shipping?.shippingType?.[0])   
                        ) {
                            isFreeShipping = true
                        }

                        if (/^auction/i.test(listingType)) {
                            priceForAuction = convertedPrice
                            bidCount = selling?.bidCount?.[0] ? (selling.bidCount)[0] * 1 : 0

                            objTabs.auction.count += 1

                            if (objTabs.buynow.is_active) continue
                        } else if (/^fixed/i.test(listingType)) {
                            priceForBuynow = convertedPrice

                            objTabs.buynow.count += 1

                            if (objTabs.auction.is_active) continue
                        }

                        if (
                            /1000/.test(item?.condition?.[0]?.conditionId?.[0]) ||
                            /^new/i.test(item?.condition?.[0]?.conditionDisplayName?.[0])
                        ) {
                            isNewProduct = true
                        }

                        itemInstance.code = item?.itemId?.[0] || product || ''
                        itemInstance.name = item?.title?.[0] || ''
                        itemInstance.url = item?.viewItemURL?.[0] || ''
                        itemInstance.image = item?.galleryURL?.[0] || ''
                        itemInstance.price = priceForAuction
                        itemInstance.price_buy = priceForBuynow
                        itemInstance.start_time = listing?.startTime?.[0]
                        itemInstance.end_time = listing?.endTime?.[0]
                        itemInstance.accept_return = returnsAccepted
                        itemInstance.seller_id = seller
                        itemInstance.bids = bidCount
                        itemInstance.watch_bid = listing?.watchCount?.[0] ? (listing.watchCount)[0] * 1 : 0
                        itemInstance.new = isNewProduct
                        itemInstance.used = !isNewProduct
                        itemInstance.freeship = isFreeShipping
                        itemInstance.item_type = ITEM_TYPE
                        itemInstance.currency = CURRENCY.USD

                        items.push(itemInstance)
                    }
                }

                response.filters = [] as Filter[]
                response.sorters = [] as Sorter[]
                response.results = [...items]
                response.tabs = [
                    {
                        label: MAPPING_TABS.ALL,
                        count: objTabs.all.count,
                        is_active: objTabs.all.is_active
                    },
                    {
                        label: MAPPING_TABS.AUCTION,
                        count: objTabs.auction.count,
                        is_active: objTabs.auction.is_active
                    },
                    {
                        label: MAPPING_TABS.BUYNOW,
                        count: objTabs.buynow.count,
                        is_active: objTabs.buynow.is_active
                    }
                ]
            }

            return response
        } catch (e) {
            throw e
        }
    }

    async productDetails(itemId: string): Promise<EbayProductResponse> {
        try {
            const objProductDetails = {
                service: EbayService.FINDING_SERVICE,
                operation: EbayService.FIND_ITEMS_BY_KEYWORDS,
                payload: {
                    'keywords': itemId,
                    'descriptionSearch': true,
                    'paginationInput.pageNumber': 1,
                    'paginationInput.entriesPerPage': 1
                }
            } as any
            
            const response = new EbayProductResponse()
            const buildURL = this.buildURIParams(objProductDetails)
            const sendRequest = (await this.httpService.get(buildURL).toPromise())?.data?.findItemsByKeywordsResponse || []

            if (Array.isArray(sendRequest) && sendRequest.length > 0) {
                const objData = new Data()
                const objSeller = new Seller()
                const objMethods = new Methods()

                const objResponse = sendRequest[0] as any
                const item = objResponse?.searchResult?.[0]?.item?.[0] || {}
                const count = objResponse?.searchResult?.[0]?.['@count']

                if (!/^success$/i.test(objResponse?.ack?.[0])) {
                    response.code = 1
                    response.status_code = 400
                    response.data = objData

                    return response
                }

                const category = item?.primaryCategory?.[0] || {}
                const selling = item?.sellingStatus?.[0] || {}
                const shipping = item?.shippingInfo?.[0] || {}
                const listing = item?.listingInfo?.[0] || {}
                const condition = item?.condition?.[0] || {}
                const seller = item?.sellerInfo?.[0] || {}
                
                const price = ((selling?.convertedCurrentPrice)?.[0])?.__value__ ? parseFloat(((selling.convertedCurrentPrice)[0]).__value__) : 0
                const isAuctionProduct = /^auction$/i.test(listing?.listingType?.[0])
                const shippingValue = ((shipping?.shippingServiceCost)?.[0])?.__value__
                const sellerName = seller?.sellerUserName?.[0] || ''
                const shippingType = item?.shippingType?.[0]

                const shipCost = (/^(calculated|free)$/i.test(shippingType) || /^(0|0.0)$/.test(shippingValue)) ? 0 : parseFloat(shippingValue)
                const start = listing?.startTime?.[0] ? moment((listing.startTime)[0]).format(DATE_FORMAT.LOCAL_DATE) : null
                const end = listing?.endTime?.[0] ? moment((listing.endTime)[0]).format(DATE_FORMAT.LOCAL_DATE) : null
                const diff = moment.duration(moment(end).diff(moment())).asMinutes()

                objSeller.url = item?.storeInfo?.[0]?.storeURL?.[0] || ''
                objSeller.id = sellerName
                objSeller.name = sellerName
                objSeller.percent = seller?.positiveFeedbackPercent?.[0] ? `${(seller.positiveFeedbackPercent)[0]}%` : ''
                objSeller.total = seller?.feedbackScore?.[0] ? (seller.feedbackScore)[0] * 1 : 0
                objSeller.avatar = ''

                objMethods.bid = isAuctionProduct
                objMethods.buy = !isAuctionProduct

                objData.code = item?.itemId?.[0] || ''
                objData.url = item?.viewItemURL?.[0] || ''
                objData.name = item?.title?.[0] || ''
                objData.price = isAuctionProduct ? price : 0
                objData.tax = 0
                objData.price_buy = isAuctionProduct ? 0 : price
                objData.tax_buy = 0
                objData.feeship = shipCost
                objData.thumbnails = [item?.galleryURL?.[0]]
                objData.description = item?.subtitle?.[0] || ''
                objData.qty = count ? count * 1 : 1
                objData.category_id = category?.categoryId?.[0] || ''
                objData.start_date = start
                objData.end_date = end
                objData.early_close = diff < 60 ? true : false
                objData.auto_extension = true
                objData.returnable = /^true$/i.test(item?.returnsAccepted?.[0])
                objData.bider_restriction = isAuctionProduct
                objData.bidder_verification = isAuctionProduct
                objData.init_price = price
                objData.condition = condition?.conditionDisplayName?.[0] || ''
                objData.seller = objSeller
                objData.bids = isAuctionProduct ? (selling?.bidCount?.[0] ? (selling.bidCount)[0] * 1 : 0) : 0
                objData.postage = true
                objData.finished = diff <= 0 ? true : false
                objData.methods = objMethods
                objData.payment_methods = []
                objData.won_info = null
                objData.time_left = selling?.timeLeft?.[0] || ''
                objData.end_time = listing?.endTime?.[0] || ''

                response.code = 0
                response.status_code = 200
                response.data = objData
            }

            return response
        } catch (e) {
            throw e
        }
    }

    async relatesProduct(itemId: string, size: number): Promise<any> {
        try {
            const objRelatesProduct = {
                service: EbayService.MERCHANDISING_SERVICE,
                operation: EbayService.GET_SIMILAR_ITEMS,
                payload: {
                    'itemId': parseInt(itemId, 10),
                    'maxResults': size
                }
            } as any

            const response = [] as EbayRelatesResponse[]
            const buildURL = this.buildURIParams(objRelatesProduct)
            const sendRequest = (await this.httpService.get(buildURL).toPromise())?.data?.getSimilarItemsResponse || {}

            if (!/success/i.test(sendRequest?.ack)) {
                return response
            }

            const itemRecommendations = sendRequest?.itemRecommendations?.item || []
            if (Array.isArray(itemRecommendations) && itemRecommendations.length > 0) {
                for (let i = 0; i < itemRecommendations.length; ++i) {
                    const item = itemRecommendations[i]
                    const itemInstance = new EbayRelatesResponse()

                    const shippingCost = item?.shippingCost?.__value__ ? parseFloat(item.shippingCost.__value__) : 0
                    const isNew = /new/i.test(item?.title)

                    itemInstance.index = i
                    itemInstance.bids = item?.bidCount * 1 || 0
                    itemInstance.code = item?.itemId || ''
                    itemInstance.site_code = ITEM_TYPE
                    itemInstance.end_time = null
                    itemInstance.freeship = shippingCost === 0
                    itemInstance.closing = true
                    itemInstance.image = item?.imageURL || ''
                    itemInstance.name = item?.title || ''
                    itemInstance.new = isNew
                    itemInstance.price = item?.currentPrice?.__value__ ? parseFloat(item.currentPrice.__value__) : 0
                    itemInstance.price_buy = item?.buyItNowPrice?.__value__ ? parseFloat(item.buyItNowPrice.__value__) : 0
                    itemInstance.seller_id = null
                    itemInstance.url = item?.viewItemURL || ''
                    itemInstance.used = !isNew
                    itemInstance.type = 'relate'

                    response.push(itemInstance)
                }
            }

            return response
        } catch (e) {
            throw e
        }
    }

    private buildURIParams(params: any = {}): string {
        let baseURL = this.ebayEndpoint

        if (params?.service === EbayService.MERCHANDISING_SERVICE) {
            baseURL += `MerchandisingService?CONSUMER-ID=${this.clientID}&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&`
        } else {
            baseURL += `services/search/FindingService/v1?SECURITY-APPNAME=${this.clientID}&SERVICE-VERSION=1.0.0&`
        }

        baseURL += `OPERATION-NAME=${params.operation ? params.operation : EbayService.FIND_ITEMS_BY_KEYWORDS}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD=true&`
        
        if (params?.payload && Object.keys(params.payload).length > 0) {
            for (const [key, value] of Object.entries(params.payload)) {
                baseURL += `${key}=${value}&`
            }
        }

        for (const [key, value] of Object.entries(OUTPUT_SELECTOR)) {
            baseURL += `outputSelector(${key})=${value}&`
        }

        return baseURL
    }
}