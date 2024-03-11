export class Pagination {
    private readonly page: number
  
    private readonly size: number

    private readonly totalPage: number
  
    private readonly total: number
  
    constructor(page: number, size: number, total: number) {
        this.page = page * 1
        this.size = size * 1
        this.totalPage = total % size === 0 ? total / size : Math.ceil(total / size)
        this.total = total
    }
  }
  
  