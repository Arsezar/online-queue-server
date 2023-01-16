import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResetTokenDocument = HydratedDocument<resetToken>;

@Schema()
export class resetToken {
  @Prop()
  value: string;

  @Prop()
  expTime: Date;

  @Prop()
  userId: string;
}

export const ResetTokenSchema = SchemaFactory.createForClass(resetToken);
