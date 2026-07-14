import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from './repository/category.repository';
import { Category, CategorySchema } from './model/category.model';
import { MenuRepository } from '../menu/repository/menu.repository';
import { Menu, MenuSchema } from '../menu/model/menu.model';
import { CloudinaryModule } from '../../common/services/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Menu.name, schema: MenuSchema }, // needed for MenuRepository
    ]),
    CloudinaryModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, MenuRepository],
  exports: [CategoryRepository],
})
export class CategoryModule {}
