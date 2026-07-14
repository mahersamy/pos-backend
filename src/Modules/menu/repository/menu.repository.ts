import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import { Menu, MenuDocument } from '../model/menu.model';
import { MENU_SELECT } from '../constants/menu.constants';

@Injectable()
export class MenuRepository extends BaseRepository<MenuDocument> {
  constructor(
    @InjectModel(Menu.name) private readonly menuModel: Model<MenuDocument>,
  ) {
    super(menuModel);
  }

  async createAndReturn(data: Partial<MenuDocument>): Promise<MenuDocument> {
    const created = await this.menuModel.create(data);
    return (
      this.menuModel
        .findById(created._id)
        .select(MENU_SELECT)
        .lean() as Promise<MenuDocument>
    );
  }
}
