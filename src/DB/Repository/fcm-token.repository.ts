import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { FcmToken, FcmTokenDocument } from '../Models/fcm-token.model';

@Injectable()
export class FcmTokenRepository extends BaseRepository<FcmTokenDocument> {
  constructor(
    @InjectModel(FcmToken.name)
    private fcmTokenModel: Model<FcmTokenDocument>,
  ) {
    super(fcmTokenModel);
  }
}
