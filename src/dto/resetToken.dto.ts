import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

export class ResetTokenDto {
  @IsNotEmpty()
  value: string;

  @IsNotEmpty()
  expTime: any;

  @IsNotEmpty()
  userId: ObjectId;
}
