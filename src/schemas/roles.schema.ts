import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuid } from "uuid";

export type RolesDocument = HydratedDocument<Roles>;

@Schema()
export class Roles {
  @Prop()
  name: string;

  @Prop()
  permissions: string[];

  @Prop()
  id: string;
}

export const RoleSchema = SchemaFactory.createForClass(Roles);
