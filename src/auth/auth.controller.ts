import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthDto } from "src/dto/auth.dto";
import { CreateUserDto } from "src/dto/create-user.dto";
import { ForgotPasswordDto } from "src/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/dto/reset-password.dto";
import { DataValidationPipe } from "src/pipes/data-validation.pipe";
import { AuthService } from "./auth.service";
import { AccessTokenGuard } from "./guards/accessToken.guard";
import { RefreshTokenGuard } from "./guards/refreshToken.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  signup(@Body(DataValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post("signin")
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @Get("logout")
  logout(@Req() req: Request) {
    this.authService.logout(req.user["sub"]);
  }
  @Post("change-data")
  async changeData(@Body(DataValidationPipe) data: CreateUserDto) {
    return this.authService.changeUserData(data);
  }

  @UseGuards(RefreshTokenGuard)
  @Get("refresh")
  refreshTokens(@Req() req: Request) {
    const userId = req.user["sub"];
    const refreshToken = req.user["refreshToken"];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get("profile")
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Post("forgot-password")
  async forgotPassword(@Body(DataValidationPipe) data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post("reset-password")
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }
}
