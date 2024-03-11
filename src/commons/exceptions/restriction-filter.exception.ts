import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { ValidationError } from 'class-validator'

@Catch(ValidationError)
export class RestrictionExceptionFilter implements ExceptionFilter {
    catch(exception: ValidationError, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()

        let message = ''
        if (exception?.constraints) {
            for (const key in exception?.constraints) {
                if (Object.hasOwnProperty.call(exception?.constraints, key)) {
                    message = exception?.constraints[key]
                    break
                }
            }
        }

        response.status(HttpStatus.OK).send({
            data: null,
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message,
        })
    }
}
