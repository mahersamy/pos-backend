import { Otp, OtpDocument } from '../model/otp.model';
import { BaseRepository } from '../../../common/database/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class OtpRepository extends BaseRepository<OtpDocument> {
  constructor(@InjectModel(Otp.name) model: Model<OtpDocument>) {
    super(model);
  }
}
