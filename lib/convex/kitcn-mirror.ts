import { BetterFetchResponse } from 'better-auth/react';
import { ColumnBuilder, ColumnBuilderBaseConfig, ColumnBuilderWithTableName, ConvexTable, DBQueryConfig, DrizzleEntity, GetColumnData, SystemFields, TableRelationalConfig, TablesRelationalConfig } from 'kitcn/orm';
import { AuthMutationError } from 'kitcn/react';

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

import * as convex_values0 from "convex/values";
import { GenericDatabaseReader, GenericDatabaseWriter } from 'convex/server';

export const toAuthMutationError = (
  error: BetterFetchResponse<unknown>['error'] & { code?: string }
) =>
  new AuthMutationError({
    code: error.code,
    message: error.message,
    status: error.status ?? 500,
    statusText: error.statusText ?? 'AUTH_ERROR',
  });

// declare const entityKind: keyof DrizzleEntity;
// type ConvexSystemCreatedAtConfig = ColumnBuilderBaseConfig<'number', 'ConvexSystemCreatedAt'> & {
//   data: number;
//   driverParam: number;
//   enumValues: undefined;
// };
// declare class ConvexSystemCreatedAtBuilder extends ColumnBuilder<ConvexSystemCreatedAtConfig, {}, {
//   notNull: true;
// }> {
//   static readonly [entityKind]: string;
//   readonly [entityKind]: string;
//   constructor();
//   build(): convex_values0.VFloat64<number, "required">;
//   get convexValidator(): convex_values0.VFloat64<number, "required">;
// }
// type SystemFieldAliases<TName extends string, TColumns extends Record<string, unknown> = {}> = 'createdAt' extends keyof TColumns ? {} : {
//   createdAt: ColumnBuilderWithTableName<ConvexSystemCreatedAtBuilder, TName>;
// };
// type TableColumns<TTableConfig extends TableRelationalConfig> = TTableConfig['table']['_']['columns'] & SystemFields<TTableConfig['table']['_']['name']> & SystemFieldAliases<TTableConfig['table']['_']['name'], TTableConfig['table']['_']['columns']>;

// type RelationsFieldFilter<T = unknown> = RelationFieldsFilterInternals<T> | (unknown extends T ? never : T extends string | number | boolean | bigint | null | undefined ? T : T extends object ? never : T) | Placeholder;
// type SchemaEntry = ConvexTable<any>;
// type GetTableColumns<TTable extends SchemaEntry> = TTable extends ConvexTable<any> ? TTable['_']['columns'] & SystemFields<TTable['_']['name']> & SystemFieldAliases<TTable['_']['name'], TTable['_']['columns']> : never;
// type TableFilterColumns<TColumns extends Record<string, unknown>> = { [K in keyof TColumns]?: (TColumns[K] extends {
//   _: {
//     data: infer Data;
//   };
// } ? RelationsFieldFilter<Data> : RelationsFieldFilter<unknown>) | undefined };

// type TableFilter<TTable extends SchemaEntry = SchemaEntry, TColumns extends Record<string, unknown> = GetTableColumns<TTable>> = Simplify$1<TableFilterColumns<TColumns> & TableFilterCommons<TTable, TColumns>>;

// type SearchIndexMap<TTableConfig extends TableRelationalConfig> = TTableConfig['table'] extends ConvexTable<any, any, infer TSearchIndexes, any> ? TSearchIndexes : Record<string, {
//   searchField: string;
//   filterFields: string;
// }>;
// type SearchIndexName<TTableConfig extends TableRelationalConfig> = Extract<keyof SearchIndexMap<TTableConfig>, string>;
// type SearchIndexConfigByName<TTableConfig extends TableRelationalConfig, TIndexName extends SearchIndexName<TTableConfig>> = SearchIndexMap<TTableConfig>[TIndexName];
// type SearchFilterFieldNames<TTableConfig extends TableRelationalConfig, TIndexName extends SearchIndexName<TTableConfig>> = SearchIndexConfigByName<TTableConfig, TIndexName> extends {
//   filterFields: infer TFilterFields extends string;
// } ? TFilterFields : never;
// type SearchFilterValueForField<TTableConfig extends TableRelationalConfig, TFieldName extends string> = TFieldName extends keyof TableColumns<TTableConfig> ? TableColumns<TTableConfig>[TFieldName] extends ColumnBuilder<any, any, any> ? GetColumnData<TableColumns<TTableConfig>[TFieldName], 'raw'> : never : never;
// type SearchFiltersForIndex<TTableConfig extends TableRelationalConfig, TIndexName extends SearchIndexName<TTableConfig>> = Partial<{ [K in SearchFilterFieldNames<TTableConfig, TIndexName>]: SearchFilterValueForField<TTableConfig, K> }>;
// type SearchQueryConfig<TTableConfig extends TableRelationalConfig = TableRelationalConfig> = [SearchIndexName<TTableConfig>] extends [never] ? never : { [TIndexName in SearchIndexName<TTableConfig>]: {
//   index: TIndexName;
//   query: string;
//   filters?: SearchFiltersForIndex<TTableConfig, TIndexName> | undefined;
// } }[SearchIndexName<TTableConfig>];
// type SearchWhereFilter<TTableConfig extends TableRelationalConfig> = TableFilter<TTableConfig['table']>;
// export type SearchFindFirstConfig<TSchema extends TablesRelationalConfig, TTableConfig extends TableRelationalConfig> = Omit<DBQueryConfig<'many', true, TSchema, TTableConfig>, 'limit' | 'search' | 'vectorSearch' | 'where' | 'orderBy' | 'cursor' | 'maxScan' | 'pipeline'> & {
//   search: SearchQueryConfig<TTableConfig>;
//   vectorSearch?: never;
//   where?: SearchWhereFilter<TTableConfig> | undefined;
//   orderBy?: never;
//   pipeline?: never;
// };

export type OrmCtxBase = {
  db: GenericDatabaseReader<any> | GenericDatabaseWriter<any>;
};

export type FindFirstConfigNoSearch<TSchema extends TablesRelationalConfig, TTableConfig extends TableRelationalConfig> = Omit<DBQueryConfig<'many', true, TSchema, TTableConfig>, 'limit' | 'search' | 'vectorSearch' | 'cursor' | 'maxScan' | 'endCursor' | 'pipeline' | 'pageByKey'> & {
  search?: undefined;
  vectorSearch?: undefined;
  endCursor?: never;
  pipeline?: never;
  pageByKey?: never;
};
export type KnownKeysOnly<T, K> = { [P in keyof T]: P extends keyof K ? T[P] : never };
export type KnownKeysOnlyStrict<T, K> = 0 extends 1 & T ? never : KnownKeysOnly<T, K>;
