/* eslint-disable */

import { BetterFetchResponse } from 'better-auth/react';
import {
  AnyColumn,
  DBQueryConfig,
  InferModelFromColumns,
  TableRelationalConfig,
  TablesRelationalConfig,
} from 'kitcn/orm';
import { AuthMutationError } from 'kitcn/react';
import { GenericDatabaseReader, GenericDatabaseWriter } from 'convex/server';

const SESSION_TOKEN_FALLBACK_KEY = 'kitcn.auth.session-token';
const SESSION_DATA_FALLBACK_KEY = 'kitcn.auth.session-data';
const getSessionStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};
// const readAuthSessionFallbackToken = () => {
//   const storage = getSessionStorage();
//   if (!storage) return null;
//   const token = storage.getItem(SESSION_TOKEN_FALLBACK_KEY);
//   return token && token.length > 0 ? token : null;
// };
const writeAuthSessionFallbackToken = (token: string | null) => {
  const storage = getSessionStorage();
  if (!storage) return;
  if (token && token.length > 0) {
    storage.setItem(SESSION_TOKEN_FALLBACK_KEY, token);
    return;
  }
  storage.removeItem(SESSION_TOKEN_FALLBACK_KEY);
};
// const readAuthSessionFallbackData = () => {
//   const storage = getSessionStorage();
//   if (!storage) return null;
//   const value = storage.getItem(SESSION_DATA_FALLBACK_KEY);
//   if (!value) return null;
//   try {
//     return JSON.parse(value);
//   } catch {
//     return null;
//   }
// };
const writeAuthSessionFallbackData = (data: object | null) => {
  const storage = getSessionStorage();
  if (!storage) return;
  if (data === null || data === void 0) {
    storage.removeItem(SESSION_DATA_FALLBACK_KEY);
    return;
  }
  storage.setItem(SESSION_DATA_FALLBACK_KEY, JSON.stringify(data));
};
export const clearAuthSessionFallback = () => {
  writeAuthSessionFallbackToken(null);
  writeAuthSessionFallbackData(null);
};

export const toAuthMutationError = (
  error: BetterFetchResponse<unknown>['error'] & { code?: string }
) =>
  new AuthMutationError({
    code: error.code,
    message: error.message,
    status: error.status ?? 500,
    statusText: error.statusText ?? 'AUTH_ERROR',
  });

// findFirst query defs
export type OrmCtxBase = {
  db: GenericDatabaseReader<any> | GenericDatabaseWriter<any>;
};

export type FindFirstConfigNoSearch<
  TSchema extends TablesRelationalConfig,
  TTableConfig extends TableRelationalConfig,
> = Omit<
  DBQueryConfig<'many', true, TSchema, TTableConfig>,
  | 'limit'
  | 'search'
  | 'vectorSearch'
  | 'cursor'
  | 'maxScan'
  | 'endCursor'
  | 'pipeline'
  | 'pageByKey'
> & {
  search?: undefined;
  vectorSearch?: undefined;
  endCursor?: never;
  pipeline?: never;
  pageByKey?: never;
};
export type KnownKeysOnly<T, K> = {
  [P in keyof T]: P extends keyof K ? T[P] : never;
};
export type KnownKeysOnlyStrict<T, K> = 0 extends 1 & T
  ? never
  : KnownKeysOnly<T, K>;
// END findFirst query defs

// query output thing
// export type TableColumns<TTableConfig extends TableRelationalConfig> = TTableConfig['table']['_']['columns'] & SystemFields<TTableConfig['table']['_']['name']> & SystemFieldAliases<TTableConfig['table']['_']['name'], TTableConfig['table']['_']['columns']>;
// export interface ColumnBuilderBase<T extends ColumnBuilderBaseConfig<ColumnDataType, string> = ColumnBuilderBaseConfig<ColumnDataType, string>, TTypeConfig extends object = object> {
//   _: ColumnBuilderTypeConfig<T, TTypeConfig>;
// }
export type ColumnBuilderBase = AnyColumn;
export type TablePolymorphicMetadataFromColumn<
  TColumn,
  TDiscriminator extends string,
> = TColumn extends {
  __polymorphic: infer TMeta;
}
  ? TMeta extends {
      as: infer TAlias extends string;
      variants: infer TVariants extends Record<
        string,
        Record<string, ColumnBuilderBase>
      >;
    }
    ? {
        as: TAlias;
        discriminator: TDiscriminator;
        variants: TVariants;
      }
    : never
  : never;
export type TablePolymorphicMetadata<
  TTableConfig extends TableRelationalConfig,
> = {
  [K in Extract<
    keyof TTableConfig['table']['_']['columns'],
    string
  >]: TablePolymorphicMetadataFromColumn<
    TTableConfig['table']['_']['columns'][K],
    K
  >;
}[Extract<keyof TTableConfig['table']['_']['columns'], string>];
export type PolymorphicResultFromMetadata<TMetadata> = TMetadata extends {
  as: infer TAlias extends string;
  discriminator: infer TDiscriminator extends string;
  variants: infer TVariants extends Record<
    string,
    Record<string, ColumnBuilderBase>
  >;
}
  ? {
      [TCase in keyof TVariants & string]: { [K in TDiscriminator]: TCase } & {
        [K in TAlias]: InferModelFromColumns<TVariants[TCase]>;
      };
    }[keyof TVariants & string]
  : {};
export type TablePolymorphicResult<TTableConfig extends TableRelationalConfig> =
  [TablePolymorphicMetadata<TTableConfig>] extends [never]
    ? {}
    : PolymorphicResultFromMetadata<TablePolymorphicMetadata<TTableConfig>>;

// END query output thing
