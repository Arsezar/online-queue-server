import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class DataValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log(value, metadata);
    for (let key in value) {
      if (typeof value[key] === "string") {
        value[key] = value[key].toLowerCase();
      }
    }
    return value;
  }
}
