import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { CreateUserDto } from "src/dto/create-user.dto";
import { User, UserDocument } from "src/schemas/user.schema";
import { v4 as uuid } from "uuid";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const isEmailExists = await this.userModel
      .exists({ email: createUserDto.email })
      .exec();
    const isPhoneExists = await this.userModel
      .exists({ phone: createUserDto.phone })
      .exec();
    const isUsernameExists = await this.userModel
      .exists({
        username: createUserDto.username,
      })
      .exec();

    if (isEmailExists) {
      throw new BadRequestException("User with this email already exists");
    }

    if (isPhoneExists) {
      throw new BadRequestException(
        "User with this phone number already exists"
      );
    }

    if (isUsernameExists) {
      throw new BadRequestException("User with this username already exists");
    }
    const createdUser = new this.userModel({
      ...createUserDto,
      cancelled: false,
      approved: false,
      processed: false,
      key: uuid(),
      appointment: null,
    });
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneAndUpdate(
    username: any,
    changedUser: any
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(username, changedUser).exec();
  }

  async findOne(username: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: ObjectId): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async delete(username) {
    const deletedUser = await this.userModel.deleteOne({ username }).exec();
    return deletedUser;
  }
}
