import { IsNotEmpty } from "class-validator";

export class AddPlaceToQueue {
  @IsNotEmpty()
  place: string;

  @IsNotEmpty()
  queueId: string;
}
