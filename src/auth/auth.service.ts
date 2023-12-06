import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { SignupDto } from './dto/Signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/mailer/mailer.service';
import { SigninDto } from './dto/Signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemand.dto';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmation.dto';
import { DeleteAccountDto } from './dto/deleteAccount.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerSrvice: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async signup(signupDto: SignupDto) {
    const { username, email, password } = signupDto;
    // ** vérifier si l'utilisateur est déja inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) throw new ConflictException('User already exists');
    // ** Hasher le mot de passe
    const hash = await bcrypt.hash(password, 10);
    // ** Enregister l'utilisateur dans la basse de données
    await this.prismaService.user.create({
      data: { username, email, password: hash },
    });
    // ** Envoyer un email de confirmation
    await this.mailerSrvice.sendSingupConfirmation(email);
    // ** Retourner une réponse de succés
    return { data: 'User succesfully created' };
  }

  async signin(SigninDto: SigninDto) {
    const { email, password } = SigninDto;
    // ** vérifier si l'utilisateur est déja inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    // ** comparer le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Password does not match');
    // ** retouner un token JWT
    const payload = {
      sub: user.userId,
      email: user.email,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: '2h',
      secret: this.configService.get('SECRET_KEY'),
    });
    return {
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  async resetPasswordDemandDto(resetPasswordDemandDto: ResetPasswordDemandDto) {
    const { email } = resetPasswordDemandDto;
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    const code = speakeasy.totp({
      secret: this.configService.get('OTP_CODE'),
      digits: 5,
      step: 60 * 15,
      encoding: 'base32',
    });
    const url = 'http://localhost:3000/auth/reset-password-confirmation';
    await this.mailerSrvice.sendResetPassword(email, url, code);
    return { data: 'Reset password email has been send' };
  }

  async resetPasswordConfirmationDto(
    resetPasswordConfrimationDto: ResetPasswordConfirmationDto,
  ) {
    const { email, password, code } = resetPasswordConfrimationDto;
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    const match = speakeasy.totp.verify({
      secret: this.configService.get('OTP_CODE'),
      token: code,
      digits: 5,
      step: 60 * 15,
      encoding: 'base32',
    });
    if (!match) throw new UnauthorizedException('Invalid/expired token');
    const hash = await bcrypt.hash(password, 10);
    await this.prismaService.user.update({
      where: { email },
      data: { password: hash },
    });
    return { data: 'Password updated' };
  }

  async deleteAccount(userId: number, deleteAccountDto: DeleteAccountDto) {
    const { password } = deleteAccountDto;
    // ** vérifier si l'utilisateur est déja inscrit
    const user = await this.prismaService.user.findUnique({
      where: { userId },
    });
    if (!user) throw new NotFoundException('User not found');
    // ** comparer le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Password does not match');
    await this.prismaService.user.delete({ where: { userId } });
    // ** Retourner une réponse de succés
    return { data: 'User succesfully deleted' };
  }
}
