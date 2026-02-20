import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Staff, StaffDocument } from '../Models/staff.model';

@Injectable()
export class StaffRepository extends BaseRepository<StaffDocument> {
  constructor(
    @InjectModel(Staff.name) private readonly StaffModel: Model<StaffDocument>,
  ) {
    super(StaffModel);
  }
}
