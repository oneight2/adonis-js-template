import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import ApiResponse from '#config/api_response'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: any, ctx: HttpContext) {
    let status = error.status || 500
    let message = error.message

    if (error.message?.includes('invalid input syntax for type uuid')) {
      status = 404
      message = 'Data Not Found'
    }

    if (error.code === 'E_ROW_NOT_FOUND') {
      status = 404
      message = 'Data Not Found'
    }

    if (error.messages) {
      status = 422
      message = error.messages?.[0]?.message || 'Validation Error'
    }

    if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      status = 401
      message = 'Unauthorized'
    }

    if (status === 500) {
      message = 'Internal Server Error'
    }

    return ctx.response.status(status).send(ApiResponse.error(message, error.stack, null))
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
