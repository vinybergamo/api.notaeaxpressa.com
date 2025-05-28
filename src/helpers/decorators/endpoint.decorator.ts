import { EndpointOptions } from '@/types/endpoint';
import {
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Head,
  Options,
  All,
  Version,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { IsPublic } from './is-public.decorator';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Cache } from './cache.decorator';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { milliseconds } from 'date-fns';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

const methodMappers = {
  GET: Get,
  POST: Post,
  PUT: Put,
  DELETE: Delete,
  PATCH: Patch,
  HEAD: Head,
  OPTIONS: Options,
  ALL: All,
};

export function Endpoint(options: EndpointOptions) {
  const {
    method,
    path,
    statusCode,
    version,
    isPublic,
    documentation,
    cache,
    throttle,
    file,
  } = options;

  const decorators = [methodMappers[method](path)];

  decorators.push(Cache(cache?.ttl, cache?.key, cache?.disable));

  if (statusCode) {
    decorators.push(HttpCode(statusCode));
  }

  if (version) {
    decorators.push(Version(version));
  }

  if (isPublic) {
    decorators.push(IsPublic());
  }

  if (!isPublic && !documentation?.security?.length) {
    decorators.push(ApiBearerAuth('bearer'));
  }

  if (!!documentation) {
    createDocumentation(documentation, decorators);
  }

  if (!!throttle) {
    createThrottle(throttle, decorators);
  }

  if (!!file) {
    if (file.isMultiple) {
      decorators.push(
        UseInterceptors(
          FilesInterceptor(file.fieldName, file.maxCount, file.options),
        ),
      );
    } else {
      decorators.push(
        UseInterceptors(FileInterceptor(file.fieldName, file.options)),
      );
    }
  }

  return applyDecorators(...decorators);
}

function createDocumentation(
  documentation: EndpointOptions['documentation'],
  decorators: MethodDecorator[],
) {
  if (documentation) {
    if (documentation.extraModels) {
      decorators.push(ApiExtraModels(...documentation.extraModels));
    }

    if (documentation.query) {
      documentation.query.forEach((query) => {
        decorators.push(ApiQuery(query));
      });
    }

    delete documentation.query;
    delete documentation.extraModels;
    decorators.push(ApiOperation(documentation));
  }

  return decorators;
}

function createThrottle(
  throttle: EndpointOptions['throttle'],
  decorators: MethodDecorator[],
) {
  if (throttle) {
    if (throttle.options) {
      const throttleOptions = { ...throttle.options };

      for (const key in throttleOptions) {
        const option: any = throttleOptions[key];

        if (option.ttl) {
          throttleOptions[key] = {
            ...option,
            ttl: milliseconds(option.ttl),
          };
        }
      }

      decorators.push(Throttle(throttleOptions as any));
    }

    if (throttle.skip) {
      if (typeof throttle.skip === 'boolean') {
        decorators.push(SkipThrottle());
      } else if (
        typeof throttle.skip === 'object' &&
        Object.keys(throttle.skip).length > 0
      ) {
        decorators.push(SkipThrottle(throttle.skip));
      }
    }
  }

  return decorators;
}
