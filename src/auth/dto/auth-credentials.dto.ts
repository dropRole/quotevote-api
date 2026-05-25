import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export default class AuthCredentialsDTO {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]*$/)
  pass: string;
}
