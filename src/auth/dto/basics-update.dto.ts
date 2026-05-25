import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export default class BasicsUpdateDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  surname: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  username: string;
}
