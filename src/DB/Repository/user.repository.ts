import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from '../Models/users.model';
import { BaseRepository } from './base.repository';
import { InjectModel } from '@nestjs/mongoose';

// ✅ Define once — reuse everywhere
export const USER_SELECT =
  'firstName lastName fullName email role age phoneNumber address profilePicture permissions isActive createdAt';

export const USER_QUERY_OPTIONS = {
  select: USER_SELECT,
};

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
