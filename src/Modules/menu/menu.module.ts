import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuRepository } from './repository/menu.repository';
import { Menu, MenuSchema } from './model/menu.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
  ],
  controllers: [MenuController],
  providers: [MenuService, MenuRepository],
  exports: [MenuRepository], // export so Category module can use it
})
export class MenuModule {}
