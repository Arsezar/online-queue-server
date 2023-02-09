import { IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class QueuePlaceDto extends CreateUserDto {
  @IsNotEmpty()
  queueName: string;
}
