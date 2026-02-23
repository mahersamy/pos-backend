import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId, QueryFilter } from 'mongoose';
import {
  ReservationRepository,
  RESERVATION_QUERY_OPTIONS,
} from '../../DB/Repository/reservation.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { GetAllReservationDto } from './dto/get-all-reservation.dto';
import type { UserDocument } from '../../DB/Models/users.model';
import { ReservationDocument } from 'src/DB/Models/reservation.model';
import { FindOptions } from 'src/DB/Repository/base.repository';

@Injectable()
export class ReservationService {
  constructor(private readonly _reservationRepository: ReservationRepository) {}

  async create(dto: CreateReservationDto, user: UserDocument) {
    const reservationDate = new Date(dto.reservationDate);

    // Check if a reservation already exists for the same table, date, and time
    const existingReservation = await this._reservationRepository.findOne({
      tableNumber: dto.tableNumber,
      reservationDate: reservationDate,
      reservationTime: dto.reservationTime,
      status: { $ne: 'cancelled' }, // Ignore cancelled reservations
    });

    if (existingReservation) {
      throw new ConflictException(
        `Table ${dto.tableNumber} is already reserved at the given date and time`,
      );
    }

    const reservation = await this._reservationRepository.createAndReturn({
      ...dto,
      reservationDate: reservationDate,
      createdBy: user._id,
    });

    return reservation;
  }

  async findAll(query: GetAllReservationDto) {
    const { page, limit, sort, search, date, status } = query;

    const filter: QueryFilter<ReservationDocument> = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { tableNumber: { $regex: search, $options: 'i' } },
        ...(isValidObjectId(search) ? [{ _id: search }] : []),
      ];
    }

    if (date) {
      // Assuming exact date match for simplify, can be expanded to start/end of day
      const searchDate = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.reservationDate = {
        $gte: searchDate,
        $lt: nextDay,
      };
    }

    if (status) {
      filter.status = status;
    }

    return this._reservationRepository.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      ...RESERVATION_QUERY_OPTIONS,
    });
  }

  async findOne(id: string) {
    const reservation = await this._reservationRepository.findById(
      id,
      {},
      RESERVATION_QUERY_OPTIONS,
    );
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto) {
    const reservation = await this._reservationRepository.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');

    const updated = await this._reservationRepository.findByIdAndUpdate(
      id,
      dto,
      RESERVATION_QUERY_OPTIONS,
    );

    return updated;
  }

  async remove(id: string) {
    const reservation = await this._reservationRepository.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');

    await this._reservationRepository.findByIdAndDelete(id);
    return 'Reservation deleted successfully';
  }
}
