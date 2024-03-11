
export class Response {
  private readonly code: number

  private readonly message: string 

  private readonly data: any

  constructor(code: number, data: any, message: string = '') {
      this.code = code
      this.message = message ? message : 'Success'
      this.data = data
  }
}

