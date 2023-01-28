import { IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";
import { ObjectId } from "mongoose";

export class QueuePlaceDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  userId: ObjectId;

  @IsNotEmpty()
  queueName: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
