import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class UnifiedResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;
    return next.handle().pipe(
      map((data) => {
        // If the response is already paginated (contains a data array and total count)
        // we spread it to avoid { data: { data: [], total: ... } }
        if (data && data.data && Array.isArray(data.data) && 'total' in data) {
          return {
            success: true,
            statusCode,
            ...data,
          };
        }

        return {
          success: true,
          statusCode,
          data,
        };
      }),
    );
  }
}
