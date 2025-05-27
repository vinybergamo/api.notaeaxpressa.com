import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { ApiOperationOptions } from '@nestjs/swagger';
import { Duration } from 'date-fns';
import {
  ThrottlerGenerateKeyFunction,
  ThrottlerGetTrackerFunction,
} from '@nestjs/throttler';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

type Resolvable<T extends number | string | boolean> =
  | T
  | ((context: ExecutionContext) => T | Promise<T>);

export interface EndpointOptions {
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS'
    | 'ALL';
  path?: string | string[];
  statusCode?: number | HttpStatus;
  version?: string | string[];
  isPublic?: boolean;
  documentation?: ApiOperationOptions & {
    extraModels?: any[];
  };
  cache?: {
    ttl?: Duration;
    key?: string;
    disable?: boolean;
  };
  file?: {
    fieldName: string;
    maxCount?: number;
    isMultiple?: boolean;
    options?: MulterOptions;
  };
  throttle?: {
    skip?: Record<string, boolean> | boolean;
    options?: Record<
      string,
      {
        limit?: Resolvable<number>;
        ttl?: Duration;
        blockDuration?: Resolvable<number>;
        getTracker?: ThrottlerGetTrackerFunction;
        generateKey?: ThrottlerGenerateKeyFunction;
      }
    >;
  };
}
