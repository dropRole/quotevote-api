import { IsNotEmpty, IsString } from 'class-validator';

export default class GetAvatarDTO {
  @IsString()
  @IsNotEmpty()
  path: string;
}
