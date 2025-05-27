import { UserRequest as User } from './user-request.interface';

export {};

declare global {
  type Id = string | number;
  type UserRequest = User;

  declare namespace Express {
    export interface Request {
      user: UserRequest;
    }
  }
}
