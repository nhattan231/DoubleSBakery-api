import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse {
  message: string;
  status: number;
  data?: any;
  list?: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse> {
    return next.handle().pipe(
      map((responseData) => {
        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse();
        const statusCode: number = response.statusCode || HttpStatus.OK;

        // Case 1: null/undefined (void methods like DELETE)
        if (responseData === null || responseData === undefined) {
          return {
            message: 'success',
            status: statusCode,
            data: null,
          };
        }

        // Case 2: Object có key 'list' → paginated list response
        if (
          typeof responseData === 'object' &&
          !Array.isArray(responseData) &&
          'list' in responseData
        ) {
          const result: StandardResponse = {
            message: 'success',
            status: statusCode,
            list: responseData.list,
          };
          if (responseData.pagination) {
            result.pagination = responseData.pagination;
          }
          return result;
        }

        // Case 3: Plain array → wrap as list
        if (Array.isArray(responseData)) {
          return {
            message: 'success',
            status: statusCode,
            list: responseData,
          };
        }

        // Case 4: Plain object → wrap as data
        return {
          message: 'success',
          status: statusCode,
          data: responseData,
        };
      }),
    );
  }
}
