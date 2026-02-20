import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from '../../DB/Models/staff.model';
import { StaffRepository } from 'src/DB/Repository/staff.repository';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }])
  ],
  controllers: [StaffController],
  providers: [StaffService,StaffRepository,CloudinaryService],
})
export class StaffModule {}
