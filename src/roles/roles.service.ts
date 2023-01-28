import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Roles, RolesDocument } from "src/schemas/roles.schema";
import { v4 as uuid } from "uuid";

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Roles.name) private rolesModel: Model<RolesDocument>
  ) {}

  async initRoles() {
    const allRoles = await this.rolesModel.find();
    const isRolesExists = allRoles?.filter(
      (role) =>
        role.name === "admin" ||
        role.name === "user" ||
        role.name === "employee"
    );
    if (isRolesExists.length === 3 && allRoles.length === 3) return;
    if (allRoles.length < 3 || allRoles.length > 3) {
      throw new HttpException(
        `YOU HAVE MORE OR LESS ROLES THAN IT NEED TO BE`,
        HttpStatus.CONFLICT
      );
    }
    const roles = [
      { name: "admin", permissions: "all", id: uuid() },
      { name: "user", permissions: "all", id: uuid() },
      { name: "employee", permissions: "all", id: uuid() },
    ];
    this.rolesModel.insertMany(roles);
  }
}
