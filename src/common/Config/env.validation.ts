import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  MOOD?: Environment;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  APPLICATIION_NAME: string;

  @IsString()
  DATABASE_URI: string;

  // Redis
  @IsString()
  REDIS_USERNAME: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  REDIS_URI: string;

  @IsString()
  CACHE_TYPE: string;

  // Email
  @IsString()
  EMAIL_USER: string;

  @IsString()
  EMAIL_PASS: string;

  // Encryption
  @IsString()
  ENCRYPTION_KEY: string;

  @IsString()
  ENCRYPTION_METHOD: string;

  @IsNumber()
  IV_LENGTH: number;

  // Hash
  @IsNumber()
  SALT_ROUND: number;

  // Admin
  @IsString()
  ADMIN_EMAIL: string;

  @IsString()
  ADMIN_PASSWORD: string;

  @IsString()
  ADMIN_PHONE: string;

  // JWT Bearer
  @IsString()
  JWT_SECRET_BEARER_ACCESS: string;

  @IsNumber()
  JWT_BEARER_ACCESS_EXP: number;

  @IsString()
  JWT_SECRET_BEARER_REFRESH: string;

  @IsNumber()
  JWT_REFRESH_BEARER_EXP: number;

  // JWT System
  @IsString()
  JWT_SECRET_SYSTEM_ACCESS: string;

  @IsNumber()
  JWT_ACCESS_SYSTEM_EXP: number;

  @IsString()
  JWT_SECRET_SYSTEM_REFRESH: string;

  @IsNumber()
  JWT_REFRESH_SYSTEM_EXP: number;

  // Cloudinary
  @IsString()
  CLOUDINARY_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;

  // Payment
  @IsString()
  STRIPE_SECRET_KEY: string;

  @IsString()
  CANCEL_URL: string;

  @IsString()
  SUCCESS_URL: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;

  // Firebase
  @IsString()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  FIREBASE_PRIVATE_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
