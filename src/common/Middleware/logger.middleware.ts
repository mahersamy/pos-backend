import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import chalk from 'chalk';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    const { originalUrl, method } = req;
    const startTime = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      console.log(
        `${chalk.green(method)} ${chalk.blue(originalUrl)} ${chalk.yellow(responseTime + 'ms')}`,
      );
    });
    next();
  }
}
