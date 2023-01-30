import { IsNotEmpty } from "class-validator";

export class RolesDto {
  @IsNotEmpty()
  roles: string[];
}
