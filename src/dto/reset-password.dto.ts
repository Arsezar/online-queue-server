import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  pass: string;

  @IsNotEmpty()
  token: string;
}
