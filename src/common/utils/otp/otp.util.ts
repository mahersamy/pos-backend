import { HashService } from "../..";

export interface OtpResult {
  otp: string;
  hashOtp: string;
  otpExpire: Date;
}

export async function generateOtp(minutes: number = 5): Promise<OtpResult> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashOtp = await new HashService().hash(otp);
  const otpExpire = new Date(Date.now() + minutes * 60 * 1000);
  return { otp, hashOtp, otpExpire };
}
