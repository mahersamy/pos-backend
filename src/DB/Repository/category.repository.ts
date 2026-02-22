import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Category, CategoryDocument } from '../Models/category.model';

export const CATEGORY_SELECT =
  'name description isActive image.secure_url menu createdAt';
export const CATEGORY_POPULATE = [
  { path: 'menu', select: 'name isActive' },
//   { path: 'createdBy', select: 'firstName lastName email' },
];
export const CATEGORY_QUERY_OPTIONS = {
  select: CATEGORY_SELECT,
  populate: CATEGORY_POPULATE,
};

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
