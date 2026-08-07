import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.resolve(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} → ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.originalUrl} → ${statusCode}: ${
          Array.isArray(message) ? message.join('; ') : message
        }`,
      );
    }

    response.status(statusCode).json({ success: false, statusCode, message });
  }

  private resolve(exception: Error): { statusCode: number; message: string | string[] } {
    // Standard NestJS exceptions (BadRequestException, NotFoundException,
    // class-validator ValidationPipe failures, etc.)
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'message' in body) {
        return { statusCode, message: (body as any).message };
      }
      return { statusCode, message: exception.message };
    }

    // Mongoose duplicate-key (E11000) — not an HttpException by default.
    if (typeof exception === 'object' && exception !== null && (exception as any).code === 11000) {
      const field = Object.keys((exception as any).keyValue ?? {})[0];
      return { statusCode: 409, message: field ? `${field} already exists` : 'Duplicate value' };
    }

    // Mongoose CastError — malformed ObjectId in a param/query.
    if (exception instanceof MongooseError && exception.name === 'CastError') {
      return { statusCode: 400, message: 'Invalid identifier format' };
    }

    // Anything else — never leak the raw error.
    return { statusCode: 500, message: 'Internal Server Error' };
  }
}
