// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

import { compressImage, CompressImageOptions } from '../../utils/files/sharp.util';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    options?: CompressImageOptions,
  ): Promise<CloudinaryResponse> {
    if (!file || !file.buffer) {
      throw new Error('No file provided for upload');
    }
    let buffer = file.buffer;

    if (options) {
      buffer = await compressImage(buffer, options);
    }

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options?.folder ? `uploads/${options.folder}` : 'uploads',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  
  async uploadFiles(
    files: Express.Multer.File[],
    options?: CompressImageOptions,
  ): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    return Promise.all(files.map((file) => this.uploadFile(file, options)));
  }

  async deleteFile(public_id: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}
