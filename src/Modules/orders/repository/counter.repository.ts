import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Counter, CounterDocument } from '../model/counter.model';

@Injectable()
export class CounterRepository {
  constructor(
    @InjectModel(Counter.name)
    private readonly counterModel: Model<CounterDocument>,
  ) {}

  /**
   * Atomically increments the named counter and returns the new sequence value.
   * Uses upsert so the document is created on first call.
   * Must be called inside a session/transaction.
   */
  async nextSequence(name: string, session: ClientSession): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { name },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, session },
    );

    return counter!.sequence;
  }
}
