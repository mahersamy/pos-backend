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
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 70,
    fit = 'cover',
    toWebp,
  } = options;

  let sharpInstance = sharp(fileBuffer, { failOnError: false }).rotate();

  // Always resize to cap large images and reduce upload payload
  sharpInstance = sharpInstance.resize({
    fit: fit,
    width: maxWidth,
    height: maxHeight,
    withoutEnlargement: true,
  });

  if (toWebp) {
    sharpInstance = sharpInstance.webp({ quality });
  }

  return await sharpInstance.toBuffer();
};
