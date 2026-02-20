import sharp from 'sharp';

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  toWebp?: boolean;
  folder?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export const compressImage = async (
  fileBuffer: Buffer,
  options: CompressImageOptions,
): Promise<Buffer> => {
  const {
    maxWidth,
    maxHeight,
    quality = 70,
    fit = 'cover',
    toWebp,
  } = options;

  let sharpInstance = sharp(fileBuffer, { failOnError: false }).rotate();

  // Resize if dimensions are provided
  if (maxWidth || maxHeight) {
    sharpInstance = sharpInstance.resize({
      fit: fit,
      width: maxWidth,
      height: maxHeight,
      withoutEnlargement: true,
    });
  }

  if (toWebp) {
    sharpInstance = sharpInstance.webp({ quality });
  }

  return await sharpInstance.toBuffer();
};
