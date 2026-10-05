import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

@Schema({ timestamps: true })
export class Counter {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, default: 0 })
  sequence: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
