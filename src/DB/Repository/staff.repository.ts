import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Staff, StaffDocument } from '../Models/staff.model';

// ✅ Define once — reuse everywhere
export const STAFF_SELECT =
  'fullname email position phoneNumber DateOfBirth salary profilePicture.secure_url startShiftTiming endShiftTiming';

export const STAFF_POPULATE = {
  path: 'createdBy',
  select: 'firstName lastName email',
};

@Injectable()
export class StaffRepository extends BaseRepository<StaffDocument> {
  constructor(
    @InjectModel(Staff.name) private readonly StaffModel: Model<StaffDocument>,
  ) {
    super(StaffModel);
  }

  // ✅ create + select workaround (Mongoose doesn't support select on create)
  async createAndReturn(data: Partial<StaffDocument>): Promise<StaffDocument> {
    const created = await this.StaffModel.create(data);
    return this.StaffModel.findById(created._id)
      .select(STAFF_SELECT)
      .populate(STAFF_POPULATE)
      .lean() as Promise<StaffDocument>;
  }
}