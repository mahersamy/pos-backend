import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import {
  InventoryMovement,
  InventoryMovementDocument,
} from '../model/inventory-movement.model';

@Injectable()
export class InventoryMovementRepository extends BaseRepository<InventoryMovementDocument> {
  private readonly logger = new Logger(InventoryMovementRepository.name);

  constructor(
    @InjectModel(InventoryMovement.name)
    private readonly movementModel: Model<InventoryMovementDocument>,
  ) {
    super(movementModel);
  }

  /**
   * Records a stock movement audit entry.
   * If an identical operation was already recorded (idempotency unique index conflict),
   * it returns the existing document instead of throwing an error.
   */
  async recordMovement(
    data: Partial<InventoryMovement>,
    session?: ClientSession,
  ): Promise<InventoryMovementDocument | null> {
    try {
      if (session) {
        const [created] = await this.movementModel.create([data], { session });
        return created;
      }
      return await this.movementModel.create(data);
    } catch (error: any) {
      if (error?.code === 11000) {
        this.logger.warn(
          `Idempotent movement detected and ignored: ${JSON.stringify(error.keyValue)}`,
        );
        return this.movementModel.findOne(error.keyValue).session(session ?? null);
      }
      throw error;
    }
  }
}
