import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();

    return user;
  },
);

export default GetUser;
