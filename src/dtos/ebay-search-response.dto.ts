export class Pagination {
    total?: number
    size?: number
    page?: number

    constructor() {
        this.page = 1
        this.size = 0
        this.total = 0
    }
}

export class Results {
    code: string
    name: string
    url: string
    image: string
    price: number
    price_buy: number
    start_time: string | null
    end_time: string | null
    seller_id: string
    bids?: number
    watch_bid?: number
    accept_return?: boolean
    new?: boolean
    used?: boolean
    freeship?: boolean
    item_type?: string
    currency?: string
}

export class Item {
    label: string
    params: any[]
    url: string
}

export class Sorter {
    header: string
    items: Item[]
}

export class Filter {
    header: string
    type: string
    data_name: string
    filters: any[]
}

export class Tab {
    label: string
    count: number
    is_active: boolean
}

export class EbaySearchResponse {
    success: boolean
    pagination: Pagination
    results: Results[]
    sorters?: Sorter[]
    filters?: Filter[]
    tabs: Tab[]
}
