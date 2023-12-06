import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDemandDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
