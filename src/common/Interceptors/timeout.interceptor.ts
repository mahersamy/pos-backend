import { CallHandler, ExecutionContext, NestInterceptor, RequestTimeoutException } from "@nestjs/common";
import { catchError, of, throwError, timeout, TimeoutError } from "rxjs";



export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            timeout(10000),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    return of(RequestTimeoutException);
                }
                return throwError(err);
            }),
        );
    }
}