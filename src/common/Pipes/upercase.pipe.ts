import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UpercasePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    return value.toUpperCase();
  }
}
