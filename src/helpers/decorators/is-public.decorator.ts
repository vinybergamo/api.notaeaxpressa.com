import { SetMetadata } from '@nestjs/common';

export const isPublicMetaKey = 'is-public';

export const IsPublic = () => SetMetadata(isPublicMetaKey, true);
