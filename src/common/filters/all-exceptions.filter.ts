import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // catches ALL errors
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx        = host.switchToHttp();
    const response   = ctx.getResponse<Response>();
    const request    = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors  = null;

    // ─── Handle HTTP Exceptions ───────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const exRes = exceptionResponse as any;
        message = exRes.message || exception.message;

        // Validation errors come as array
        if (Array.isArray(exRes.message)) {
          message = 'Validation failed';
          errors  = exRes.message;
        }
      }
    }

    // ─── Handle Sequelize Errors ──────────────────────────
    else if (exception instanceof Error) {
      const err = exception as any;

      // Duplicate entry (email already exists)
      if (err.name === 'SequelizeUniqueConstraintError') {
        status  = HttpStatus.CONFLICT;
        message = 'Resource already exists';
      }
      // Validation error
      else if (err.name === 'SequelizeValidationError') {
        status  = HttpStatus.BAD_REQUEST;
        message = 'Validation error';
        errors  = err.errors?.map((e: any) => e.message);
      }
      else {
        message = exception.message;
      }
    }

    // ─── Log errors ───────────────────────────────────────
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}: ${message}`,
      );
    }

    // ─── Send Response ────────────────────────────────────
    response.status(status).json({
      success:   false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path:      request.url,
    });
  }
}