import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Reservation, ReservationDocument } from '../Models/reservation.model';

export const RESERVATION_SELECT =
  'tableNumber paxNumber reservationDate reservationTime depositFee status title firstName lastName phoneNumber email createdAt';
export const RESERVATION_QUERY_OPTIONS = {
  select: RESERVATION_SELECT,
};

@Injectable()
export class ReservationRepository extends BaseRepository<ReservationDocument> {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {
    super(reservationModel);
  }

  async createAndReturn(
    data: Partial<ReservationDocument>,
  ): Promise<ReservationDocument> {
    const created = await this.reservationModel.create(data);
    return this.reservationModel
      .findById(created._id)
      .select(RESERVATION_SELECT)
      .lean() as Promise<ReservationDocument>;
  }
}
