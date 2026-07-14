import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import { Category, CategoryDocument } from '../model/category.model';
import { CATEGORY_SELECT, CATEGORY_POPULATE } from '../constants/category.constants';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }

  async createAndReturn(
    data: Partial<CategoryDocument>,
  ): Promise<CategoryDocument> {
    const created = await this.categoryModel.create(data);
    return this.categoryModel
      .findById(created._id)
      .select(CATEGORY_SELECT)
      .populate(CATEGORY_POPULATE)
      .lean() as Promise<CategoryDocument>;
  }
}
