import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class HashService {
  async hash(
    text: string,
    timeCost: number = Number(process.env.SALT_ROUND),
  ): Promise<string> {
    return await argon2.hash(text, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: timeCost,
      parallelism: 2,
    });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return await argon2.verify(hash, plain);
  }
}
