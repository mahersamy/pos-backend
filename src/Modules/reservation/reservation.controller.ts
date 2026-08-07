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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/request/create-reservation.dto';
import { UpdateReservationDto } from './dto/request/update-reservation.dto';
import { GetAllReservationDto } from './dto/request/get-all-reservation.dto';
import {
  ReservationResponseDto,
  PaginatedReservationResponseDto,
} from './dto/response/reservation-response.dto';
import {
  Action,
  AuthUser,
  CheckPermissions,
  ParamIdDto,
  Resource,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../users/models/users.model';

@ApiTags('Reservations')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [] })
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) { }

  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiCreatedResponse({ description: 'Reservation created successfully', type: ReservationResponseDto })
  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.WRITE] })
  @Post()
  create(@Body() dto: CreateReservationDto, @AuthUser() user: UserDocument) {
    return this.reservationService.create(dto, user);
  }

  @ApiOperation({ summary: 'Get all reservations (paginated)' })
  @ApiOkResponse({ description: 'List of reservations retrieved successfully', type: PaginatedReservationResponseDto })
  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllReservationDto) {
    return this.reservationService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a reservation by ID' })
  @ApiOkResponse({ description: 'Reservation retrieved successfully', type: ReservationResponseDto })
  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.reservationService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a reservation by ID' })
  @ApiOkResponse({ description: 'Reservation updated successfully', type: ReservationResponseDto })
  @CheckPermissions({ resource: Resource.RESERVATION, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateReservationDto) {
    return this.reservationService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a reservation by ID' })
  @ApiOkResponse({ description: 'Reservation deleted successfully' })
  @CheckPermissions({
    resource: Resource.RESERVATION,
    actions: [Action.DELETE],
  })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.reservationService.remove(id);
  }
}
