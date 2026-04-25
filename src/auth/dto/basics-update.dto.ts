import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class BasicsUpdateDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  surname: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;
}
