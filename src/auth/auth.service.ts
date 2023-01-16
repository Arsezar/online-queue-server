import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { isEmail, isPhoneNumber } from 'class-validator';
import { AuthDto } from 'src/dto/auth.dto';
import { ForgotPasswordDto } from 'src/dto/forgot-password.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetTokenDto } from 'src/dto/resetToken.dto';
import { resetToken, ResetTokenDocument } from 'src/schemas/resetToken.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuid } from 'uuid';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @InjectModel(resetToken.name)
    private resetTokenModel: Model<ResetTokenDocument>,
  ) {}

  async signUp(registrationData: CreateUserDto): Promise<any> {
    const userExists = await this.usersService.findOne(
      registrationData.username,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });
      const tokens = await this.getTokens(
        createdUser._id,
        createdUser.username,
      );
      await this.updateRefreshToken(createdUser._id, createdUser.username);
      return tokens;
    } catch (error) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
  }

  async signIn(authDto: AuthDto) {
    try {
      const user = await this.usersService.findOne(authDto.username);
      await this.bcryptVerify(authDto.password, user.password);
      user.password = undefined;
      const tokens = await this.getTokens(user._id, user.username);
      await this.updateRefreshToken(user._id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user)
      throw new HttpException(
        'User with this email doesn`t exist',
        HttpStatus.BAD_REQUEST,
      );
    const resetDate = new Date(new Date().getTime() + 180 * 60000);
    const resetToken = await this.createResetToken({
      value: uuid(),
      expTime: resetDate,
      userId: user.id,
    });
    await this.mailService.sendPassReset(user, resetToken.value);
    return 'email send success';
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const resetToken = await this.checkResetToken(resetPasswordDto.token);
    const user = await this.usersService.findById(resetToken.userId);
    const newHashedPassword = await bcrypt.hash(resetPasswordDto.pass, 10);
    await this.usersService.findOneAndUpdate(user, newHashedPassword);
  }

  async logout(userId: any) {
    return this.usersService.findOneAndUpdate(userId, { refreshToken: null });
  }

  private async bcryptVerify(plainText: string, hashedData: string) {
    const isPasswordMatching = await bcrypt.compare(plainText, hashedData);
    if (!isPasswordMatching) {
      console.dir(1);
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async changeUserData(changedUser: CreateUserDto) {
    try {
      const user = await this.usersService.findOne(changedUser.username);
      await this.bcryptVerify(changedUser.password, user.password);
      changedUser.password = user.password;
      await this.dataValidation(changedUser);
      await this.usersService.findOneAndUpdate(
        changedUser.username,
        changedUser,
      );
      return changedUser;
    } catch (error) {
      console.dir(2);
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async dataValidation(user: any) {
    const isEmailvalid = isEmail(user.email);
    const isPhoneValid = isPhoneNumber(user.phone);
    if (!isEmailvalid || !isPhoneValid) {
      throw new HttpException(
        'Phone or email is invalid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTokens(userId: any, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: any, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.findOneAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    await this.bcryptVerify(user.refreshToken, refreshToken);
    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async createResetToken(resetTokenDto: ResetTokenDto) {
    const isTokenExists = this.resetTokenModel.exists({
      value: resetTokenDto.value,
    });
    if (isTokenExists) {
      const currentResetToken = await this.resetTokenModel
        .findOne({ value: resetTokenDto.value })
        .exec();
      const token: string = currentResetToken.value;
      const updatedToken = await this.resetTokenModel
        .findOneAndUpdate({ token }, resetTokenDto)
        .exec();
      return updatedToken;
    }
    const createdResetToken = new this.resetTokenModel(resetTokenDto);
    return createdResetToken.save();
  }

  async checkResetToken(token: string) {
    const currentResetToken = await this.resetTokenModel
      .findOne({ token })
      .exec();
    const currentDate = new Date();
    if (currentDate.getTime() <= currentResetToken.expTime.getTime())
      return currentResetToken;
    else
      throw new HttpException('ResetToken is invalid', HttpStatus.BAD_REQUEST);
  }
}
