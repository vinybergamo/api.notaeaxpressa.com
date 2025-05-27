import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { Duration, milliseconds } from 'date-fns';
import { HttpCacheInterceptor } from '../interceptors/http-cache.interceptor';

export function Cache(
  duration?: Duration | number,
  key?: string,
  disable?: boolean,
) {
  const decorators = [];

  if (disable) {
    return applyDecorators();
  }

  decorators.push(UseInterceptors(HttpCacheInterceptor));

  if (key) {
    decorators.push(CacheKey(key));
  }

  if (duration) {
    if (typeof duration === 'number') {
      decorators.push(CacheTTL(duration));
    }

    if (typeof duration === 'object') {
      decorators.push(CacheTTL(milliseconds(duration)));
    }
  }

  return applyDecorators(...decorators);
}
