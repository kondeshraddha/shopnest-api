import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// @CurrentUser() decorator
// Gets logged in user from request
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data provided → return specific field
    // @CurrentUser('id')    → returns user.id
    // @CurrentUser('email') → returns user.email
    // @CurrentUser()        → returns full user
    return data ? user?.[data] : user;
  },
);