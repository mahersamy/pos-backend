import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

@Injectable()
export class EncryptionService {
  private key = Buffer.from(process.env.ENCRYPTION_KEY!, 'utf8');

  async encrypt(text: string) {
    if (this.key.length !== 32) {
      throw new Error(
        `Encryption key must be 32 bytes, got ${this.key.length}`,
      );
    }

    const iv = crypto.randomBytes(Number(process.env.IV_LENGTH));
    const cypher = crypto.createCipheriv(
      process.env.ENCRYPTION_METHOD!,
      this.key,
      iv,
    );
    let encryptedData = cypher.update(text, 'utf-8', 'hex');
    encryptedData += cypher.final('hex');
    return `${iv.toString('hex')}:${encryptedData}`;
  }

  decrypt(encryptText: string) {
    const [ivHex, encryptData] = encryptText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_METHOD!,
      this.key,
      iv,
    );
    let decrypted = decipher.update(encryptData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
}
