import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class TimingMiddleware implements NestMiddleware {
    private readonly logger: Logger = new Logger(TimingMiddleware.name)

    use(req: Request, res: Response, next: NextFunction) {
        const startTime = process.hrtime()

        res.on('finish', () => {
            const elapsed = process.hrtime(startTime)
            const elapsedMs = elapsed[0] * 1000 + elapsed[1] / 1e6
            const moduleName = req.route.path // Customize this to log the desired module name

            this.logger.log(`[${moduleName}] Execution time: ${elapsedMs.toFixed(2)}ms`)
        })

        next()
    }
}