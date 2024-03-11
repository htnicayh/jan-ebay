import { Injectable, Logger, NestMiddleware } from "@nestjs/common"
import { NextFunction, Request, Response } from "express"

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private logger = new Logger(LoggingMiddleware.name)

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req
        const userAgent = req.get('user-agent') || ''

        this.logger.log(`[${method}] ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`)

        next()
    }
}