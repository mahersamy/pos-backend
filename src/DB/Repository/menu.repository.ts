import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Menu, MenuDocument } from '../Models/menu.model';

export const MENU_SELECT = 'name description isActive createdAt';
// export const MENU_POPULATE = {
//   path: 'createdBy',
//   select: 'firstName lastName email',
// };
export const MENU_QUERY_OPTIONS = {
  select: MENU_SELECT,
//   populate: MENU_POPULATE,
};

@Injectable()
export class MenuRepository extends BaseRepository<MenuDocument> {
  constructor(
    @InjectModel(Menu.name) private readonly menuModel: Model<MenuDocument>,
  ) {
    super(menuModel);
  }

  async createAndReturn(data: Partial<MenuDocument>): Promise<MenuDocument> {
    const created = await this.menuModel.create(data);
    return this.menuModel
      .findById(created._id)
      .select(MENU_SELECT)
    //   .populate(MENU_POPULATE)
      .lean() as Promise<MenuDocument>;
  }
}
