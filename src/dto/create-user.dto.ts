import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  username: string;

  roles: Role[];
}
