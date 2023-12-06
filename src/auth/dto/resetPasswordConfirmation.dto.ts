import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordConfirmationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  code: string;
}
