import { SetMetadata } from '@nestjs/common';

// Key to mark route as public
export const IS_PUBLIC_KEY = 'isPublic';

// @Public() decorator
// Use on any route that doesn't need login
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);