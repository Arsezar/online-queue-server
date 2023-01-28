import { IsNotEmpty } from "class-validator";

export class QueueDto {
  places: [];

  @IsNotEmpty()
  name: string;

  usersQueue: [];
}
