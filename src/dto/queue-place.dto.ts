import { IsEmail, IsNotEmpty } from "class-validator";
import { ObjectId } from "mongoose";

export class QueuePlaceDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  userId: ObjectId;

  isApproved: boolean;
}
