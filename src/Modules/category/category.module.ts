import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../../DB/Repository/category.repository';
import { Category, CategorySchema } from '../../DB/Models/category.model';
import { MenuRepository } from '../../DB/Repository/menu.repository';
import { Menu, MenuSchema } from '../../DB/Models/menu.model';
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
