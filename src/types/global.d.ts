import { UserRequest as User } from './user-request.interface';
import { Application as ApplicationEntity } from '@/applications/entities/application.entity';

export {};

declare global {
  type Id = string | number;
  type UserRequest = User;

  declare namespace Express {
    export interface Request {
      user: UserRequest;
      application?: ApplicationEntity | null;
    }
  }
}
