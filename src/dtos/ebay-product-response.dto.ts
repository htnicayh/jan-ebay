export class Methods {
    bid: boolean
    buy: boolean
}

export class Seller {
    url: string
    id: string
    name: string
    total: number
    percent: string
    avatar?: string
}

export class Data {
    code: string
    url: string
    name: string
    price: number
    tax: number
    price_buy: number
    tax_buy: number
    feeship: number
    thumbnails: string[]
    description: string
    qty: number
    category_id: string
    start_date: string
    end_date: string
    early_close: boolean
    auto_extension: boolean
    returnable: boolean
    bider_restriction: boolean
    bidder_verification: boolean
    init_price: number
    condition: string
    seller: Seller
    bids: number
    postage: boolean
    finished: boolean
    methods: Methods
    payment_methods: string[]
    won_info: unknown | null
    time_left: string
    end_time: string
}

export class EbayProductResponse {
    code: number
    data: Data
    status_code: number
    categories?: any[]
}