import { IsNotEmpty } from "class-validator";

export class AddToQueueDto {
  @IsNotEmpty()
  username: string;
}
