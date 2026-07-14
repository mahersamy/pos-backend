import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import { User, UserDocument } from '../models/users.model';
import { USER_SELECT } from '../constants/user.constants';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  // ✅ create + select workaround (Mongoose doesn't support select on create)
  async createAndReturn(data: Partial<UserDocument>): Promise<UserDocument> {
    const created = await this.userModel.create(data);
    return this.userModel
      .findById(created._id)
      .select(USER_SELECT) as Promise<UserDocument>;
  }
}
