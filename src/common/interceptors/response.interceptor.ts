import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {

    const request    = context.switchToHttp().getRequest<Request>();
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        // Extract message and data if provided
        const message  = data?.message || 'Success';
        const resData  = data?.data !== undefined ? data.data : data;
        const meta     = data?.meta;

        return {
          success:    true,
          statusCode,
          message,
          data:       resData,
          ...(meta && { meta }),
          timestamp:  new Date().toISOString(),
          path:       request.url,
        };
      }),
    );
  }
}