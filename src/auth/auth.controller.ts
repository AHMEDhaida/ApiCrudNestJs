import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { SignupDto } from './dto/Signup.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/Signin.dto';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemand.dto';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmation.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DeleteAccountDto } from './dto/deleteAccount.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  signup(@Body() signup: SignupDto) {
    return this.authService.signup(signup);
  }

  @Post('signin')
  signin(@Body() signin: SigninDto) {
    return this.authService.signin(signin);
  }

  @Post('reset-password')
  async resetPasswordDemand(
    @Body() resetPasswordDemandDto: ResetPasswordDemandDto,
  ) {
    return this.authService.resetPasswordDemandDto(resetPasswordDemandDto);
  }

  @Post('reset-password-confirmation')
  async resetPasswordConfirmation(
    @Body() resetPasswordConfrimationDto: ResetPasswordConfirmationDto,
  ) {
    return this.authService.resetPasswordConfirmationDto(
      resetPasswordConfrimationDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  async deleteAccount(
    @Req() request: Request,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    const userId = request.user['userId'];
    await this.authService.deleteAccount(userId, deleteAccountDto);
  }
}
