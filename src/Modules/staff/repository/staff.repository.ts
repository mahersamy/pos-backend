import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { BaseRepository } from "../../../common/database/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Staff, StaffDocument } from "../model/staff.model";
import { STAFF_SELECT, STAFF_POPULATE } from "../constants/staff.constants";

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
