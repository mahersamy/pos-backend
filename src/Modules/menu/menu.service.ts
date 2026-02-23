import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import {
  MenuRepository,
  MENU_QUERY_OPTIONS,
} from '../../DB/Repository/menu.repository';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { GetAllMenuDto } from './dto/get-all-menu.dto';
import type { UserDocument } from '../../DB/Models/users.model';

@Injectable()
export class MenuService {
  constructor(private readonly _menuRepository: MenuRepository) {}

  async create(dto: CreateMenuDto, user: UserDocument) {
    const existing = await this._menuRepository.findOne({
      name: dto.name.toLowerCase(),
    });
    if (existing) throw new ConflictException('Menu name already exists');

    const menu = await this._menuRepository.createAndReturn({
      ...dto,
      createdBy: user._id,
    });

    return menu;
  }

  async findAll(query: GetAllMenuDto) {
    const { page, limit, sort, search } = query;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            ...(isValidObjectId(search) ? [{ _id: search }] : []),
          ],
        }
      : {};

    return this._menuRepository.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      ...MENU_QUERY_OPTIONS,
    });
  }

  async findOne(id: string) {
    const menu = await this._menuRepository.findById(
      id,
      {},
      MENU_QUERY_OPTIONS,
    );
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    const menu = await this._menuRepository.findById(id);
    if (!menu) throw new NotFoundException('Menu not found');

    if (dto.name && dto.name.toLowerCase() !== menu.name) {
      const nameExists = await this._menuRepository.findOne({
        name: dto.name.toLowerCase(),
        _id: { $ne: id },
      });
      if (nameExists) throw new ConflictException('Menu name already exists');
    }

    const updated = await this._menuRepository.findByIdAndUpdate(
      id,
      dto,
      MENU_QUERY_OPTIONS,
    );

    return updated;
  }

  async remove(id: string) {
    const menu = await this._menuRepository.findById(id);
    if (!menu) throw new NotFoundException('Menu not found');

    await this._menuRepository.findByIdAndDelete(id);
    return 'Menu deleted successfully';
  }
}
