import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const isEmailExist = await this.userModel.exists({
      email: createUserDto.email,
    });

    const isPhoneExist = await this.userModel.exists({
      phone: createUserDto.phone,
    });

    if (isEmailExist) {
      throw new HttpException('Email has already exists', HttpStatus.CONFLICT);
    }

    if (isPhoneExist) {
      throw new HttpException(
        'Phone number has already exists',
        HttpStatus.CONFLICT,
      );
    }

    const createdUser = new this.userModel(createUserDto);
    createdUser.save();
    console.log(createdUser);
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username: username }).exec();
  }

  async delete(id: string) {
    const deletedUser = await this.userModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedUser;
  }
}
