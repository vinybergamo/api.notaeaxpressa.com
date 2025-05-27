import { User } from 'src/users/entities/user.entity';
import { FilterPrimitive } from './filter-primitive.interface';

export type UserRequest = Pick<User, FilterPrimitive<User>>;
