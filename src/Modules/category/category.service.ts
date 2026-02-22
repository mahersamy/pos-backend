import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import {
  CategoryRepository,
  CATEGORY_QUERY_OPTIONS,
} from '../../DB/Repository/category.repository';
import { MenuRepository } from '../../DB/Repository/menu.repository';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetAllCategoryDto } from './dto/get-all-category.dto';
import type { UserDocument } from 'src/DB/Models/users.model';

@Injectable()
export class CategoryService {
  constructor(
    private readonly _categoryRepository: CategoryRepository,
    private readonly _menuRepository: MenuRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateCategoryDto, user: UserDocument) {
    // Verify menu exists
    const menu = await this._menuRepository.findById(dto.menu);
    if (!menu) throw new NotFoundException('Menu not found');

    // Name must be unique within the same menu
    const existing = await this._categoryRepository.findOne({
      name: dto.name.toLowerCase(),
      menu: dto.menu,
    });
    if (existing) {
      throw new ConflictException('Category name already exists in this menu');
    }

    const category = await this._categoryRepository.createAndReturn({
      ...dto,
      menu: dto.menu as any,
      createdBy: user._id,
    });

    return category;
  }

  async findAll(query: GetAllCategoryDto) {
    const { page, limit, sort, search, menuId } = query;

    const filter: Record<string, any> = {};

    // Filter by menu if provided
    if (menuId) filter.menu = menuId;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        ...(isValidObjectId(search) ? [{ _id: search }] : []),
      ];
    }

    return this._categoryRepository.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      ...CATEGORY_QUERY_OPTIONS,
    });
  }

  async findOne(id: string) {
    const category = await this._categoryRepository.findById(
      id,
      {},
      CATEGORY_QUERY_OPTIONS,
    );
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this._categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    // If changing menu, verify it exists
    const menuId = dto.menu ?? category.menu.toString();
    if (dto.menu) {
      const menu = await this._menuRepository.findById(dto.menu);
      if (!menu) throw new NotFoundException('Menu not found');
    }

    // Check name uniqueness within menu
    if (dto.name && dto.name.toLowerCase() !== category.name) {
      const nameExists = await this._categoryRepository.findOne({
        name: dto.name.toLowerCase(),
        menu: menuId,
        _id: { $ne: id },
      });
      if (nameExists) {
        throw new ConflictException(
          'Category name already exists in this menu',
        );
      }
    }

    const updated = await this._categoryRepository.findByIdAndUpdate(
      id,
      dto,
      CATEGORY_QUERY_OPTIONS,
    );

    return updated;
  }

  async addImage(id: string, image: Express.Multer.File) {
    const category = await this._categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    if (!image) throw new BadRequestException('No image provided');

    // Delete old image if exists
    if (category.image?.public_id) {
      await this.cloudinaryService.deleteFile(String(category.image.public_id));
    }

    const [uploaded] = await this.cloudinaryService.uploadFiles([image], {
      folder: 'categories',
      quality: 60,
      toWebp: true,
    });

    const updated = await this._categoryRepository.findByIdAndUpdate(
      id,
      {
        image: {
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        },
      },
      CATEGORY_QUERY_OPTIONS,
    );

    return updated;
  }

  async remove(id: string) {
    const category = await this._categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    if (category.image?.public_id) {
      await this.cloudinaryService.deleteFile(String(category.image.public_id));
    }

    await this._categoryRepository.findByIdAndDelete(id);
    return 'Category deleted successfully';
  }
}
