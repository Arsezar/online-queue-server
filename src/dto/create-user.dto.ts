import { IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";
import { ObjectId } from "mongoose";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  username: string;

  refreshToken: string;

  roles: string;
}
