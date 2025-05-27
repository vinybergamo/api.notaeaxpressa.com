import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
  CacheInterceptor,
} from '@nestjs/cache-manager';
import { ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { milliseconds, millisecondsToSeconds } from 'date-fns';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor
  extends CacheInterceptor
  implements NestInterceptor
{
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const method = request.method;

    const cacheControl = request.headers['cache-control'];

    if (cacheControl && cacheControl.includes('no-cache')) {
      return undefined;
    }

    if (method !== 'GET') {
      return undefined;
    }

    const cacheKey = this.generateKey(request, context);

    if (res.statusCode !== 200) {
      return undefined;
    }

    const ttl = this.getCacheTtl(context);

    res.setHeader('Cache-Control', `max-age=${millisecondsToSeconds(ttl)}`);

    return cacheKey;
  }

  private generateKey(
    request: Request<
      Record<string, any>,
      any,
      Record<string, any>,
      Record<string, any>
    >,
    context: ExecutionContext,
  ): string {
    const url = request.url;
    const method = request.method;
    const user = request.user;
    const params = request.params;
    const paramsKeys = Object.keys(params);
    const paramsValues = Object.values(params);
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    if (paramsKeys.length > 0 && cacheKey) {
      const cacheKeyWithParams = paramsKeys.reduce((acc, key, index) => {
        return acc.replace(`:${key}`, paramsValues[index]);
      }, cacheKey);

      return `${method}:${cacheKeyWithParams}`;
    }

    if (user) {
      return `${method}:/user/${user.id}${url}`;
    }

    return `${method}:${url}`;
  }

  private getCacheTtl(context: ExecutionContext): number | undefined {
    const cacheTtl =
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ||
      milliseconds({ seconds: 30 });

    if (cacheTtl) {
      return cacheTtl;
    }

    return undefined;
  }
}
