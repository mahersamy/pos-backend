import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import { FcmToken, FcmTokenDocument } from '../models/fcm-token.model';

@Injectable()
export class FcmTokenRepository extends BaseRepository<FcmTokenDocument> {
  constructor(
    @InjectModel(FcmToken.name)
    private fcmTokenModel: Model<FcmTokenDocument>,
  ) {
    super(fcmTokenModel);
  }
}
