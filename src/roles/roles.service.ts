import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { isValidObjectId, Model } from "mongoose";
import { RolesDto } from "src/dto/roles.dto";
import { Roles, RolesDocument } from "src/schemas/roles.schema";

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Roles.name) private rolesModel: Model<RolesDocument>
  ) {}

  async initRoles() {
    const allRoles = await this.rolesModel.find();
    if (allRoles.length && allRoles.length !== 3) {
      throw new HttpException(
        `YOU HAVE MORE OR LESS ROLES THAN IT NEED TO BE`,
        HttpStatus.CONFLICT
      );
    }
    const isRolesExists = allRoles?.filter(
      (role) =>
        role.name === "admin" ||
        role.name === "client" ||
        role.name === "employee"
    );
    allRoles?.forEach((role) => {
      if (!mongoose.isValidObjectId(role._id)) {
        throw new HttpException(
          `${role.name} have invalid ObjectId - ${role._id}`,
          HttpStatus.CONFLICT
        );
      }
    });
    if (isRolesExists.length === 3 && allRoles.length === 3) return;
    const roles = [
      { name: "admin", permissions: "all" },
      { name: "client", permissions: "all" },
      { name: "employee", permissions: "all" },
    ];
    this.rolesModel.insertMany(roles);
  }

  // async signRoles(rolesDto: RolesDto) {
  //   const allRoles = await this.rolesModel.find();
  //   if (!allRoles)
  //     throw new HttpException(
  //       "Role with this name doesn`t exist",
  //       HttpStatus.BAD_REQUEST
  //     );
  //   const isRolesExists = allRoles?.filter(
  //     (role) =>
  //       role.name === "admin" ||
  //       role.name === "user" ||
  // role.name === "employee"
  //   );
  //   return [];
  // }

  async findRoles(rolesDto: RolesDto) {
    const role = await this.rolesModel.findOne({ name: rolesDto.name });
    return role;
  }

  async findById(id: string) {
    return this.rolesModel.findById(id);
  }

  async isObjectIdValid(id: string) {
    if (isValidObjectId(id)) {
      if (String(new mongoose.Types.ObjectId(id)) === id) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
