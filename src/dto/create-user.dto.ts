import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";
import { Role } from "src/enums/role.enum";

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

  roles: Role[];
}
