import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { GetAllReservationDto } from './dto/get-all-reservation.dto';
import {
  Action,
  AuthUser,
  CheckPermissions,
  ParamIdDto,
  Resource,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../../DB/Models/users.model';

@AuthApply({ roles: [] })
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.WRITE] })
  @Post()
  create(@Body() dto: CreateReservationDto, @AuthUser() user: UserDocument) {
    return this.reservationService.create(dto, user);
  }

  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllReservationDto) {
    return this.reservationService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.reservationService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateReservationDto) {
    return this.reservationService.update(id, dto);
  }

  @CheckPermissions({
    resource: Resource.RESERVATION,
    actions: [Action.DELETE],
  })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.reservationService.remove(id);
  }
}
