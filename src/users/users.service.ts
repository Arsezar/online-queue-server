import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const isEmailExist = await this.userModel.exists({
      email: createUserDto.email,
    });

    const isPhoneExist = await this.userModel.exists({
      phone: createUserDto.phone,
    });

    const isUsernameExist = await this.userModel.exists({
      username: createUserDto.username,
    });

    if (isEmailExist) {
      throw new HttpException('Email has already exists', HttpStatus.CONFLICT);
    }

    if (isUsernameExist) {
      throw new HttpException(
        'Username has already exists',
        HttpStatus.CONFLICT,
      );
    }

    if (isPhoneExist) {
      throw new HttpException(
        'Phone number has already exists',
        HttpStatus.CONFLICT,
      );
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneAndUpdate(
    username: any,
    changedUser: any,
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(username, changedUser).exec();
  }

  async findOne(username: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
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
