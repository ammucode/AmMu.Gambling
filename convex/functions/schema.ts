import { GAME_PATH_SCHEMA, GameSlug } from '@/lib/games/games';
import {
  AnyColumn,
  arrayOf,
  boolean,
  ConvexForeignKeyConfig,
  ConvexTable,
  convexTable,
  ConvexTableWithColumns,
  defineSchema,
  eq,
  foreignKey,
  index,
  InferInsertModel,
  InferSelectModel,
  integer,
  TableConfig,
  text,
  timestamp,
  uniqueIndex,
} from 'kitcn/orm';
import { isMutationCtx } from 'kitcn/server';
import z from 'zod';
import { createUsersCaller } from './generated/users.runtime';

export const userTable = convexTable(
  'user',
  {
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
    userId: text(),
    username: text().unique().notNull(),
    displayUsername: text(),
    isAnonymous: boolean().notNull(),
    balance: integer().notNull().default(0),
  },
  (userTable) => [
    index('email_name').on(userTable.email, userTable.name),
    index('name').on(userTable.name),
  ]
);

export const sessionTable = convexTable(
  'session',
  {
    expiresAt: timestamp().notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
  },
  (sessionTable) => [
    index('expiresAt').on(sessionTable.expiresAt),
    index('expiresAt_userId').on(sessionTable.expiresAt, sessionTable.userId),
    index('userId').on(sessionTable.userId),
    // userIdFK(sessionTable.userId),
  ]
);

export const accountTable = convexTable(
  'account',
  {
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    password: text(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (accountTable) => [
    index('accountId').on(accountTable.accountId),
    index('accountId_providerId').on(
      accountTable.accountId,
      accountTable.providerId
    ),
    index('providerId_userId').on(accountTable.providerId, accountTable.userId),
    index('userId').on(accountTable.userId),
    // userIdFK(accountTable.userId),
  ]
);

export const jwksTable = convexTable('jwks', {
  publicKey: text().notNull(),
  privateKey: text().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
  expiresAt: timestamp(),
});

export const gameSessionTable = convexTable(
  'gameSession',
  {
    path: arrayOf(text().notNull())
      .notNull()
      .$type<z.infer<typeof GAME_PATH_SCHEMA>>(),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    sessionKey: text().notNull().unique().$type<GameSlug>(),
    money: integer().notNull().default(0),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (gameSessionTable) => [
    index('path').on(gameSessionTable.path),
    index('userId').on(gameSessionTable.userId),
    uniqueIndex('path_userId').on(
      gameSessionTable.path,
      gameSessionTable.userId
    ),
    // userIdFK(gameSessionTable.userId),
  ]
);

const genericGameColumns = {
  sessionKey: text()
    .notNull()
    .unique()
    .$type<GameSlug>()
    .references(() => gameSessionTable.sessionKey, { onDelete: 'cascade' }),
} as const satisfies Parameters<typeof convexTable>[1];
function genericGameExtras<Table extends typeof genericGameColumns>(
  table: Table
) {
  return [index('sessionKey').on(table.sessionKey)] as const;
}

export const easyCrapsSessionTable = convexTable(
  'easyCrapsSession',
  {
    ...genericGameColumns,
  },
  (easyCrapsSessionTable) => [...genericGameExtras(easyCrapsSessionTable)]
);

export const tables = {
  user: userTable,
  session: sessionTable,
  account: accountTable,
  jwks: jwksTable,

  gameSession: gameSessionTable,
};
export type TableName = keyof typeof tables;
export type Select<T extends TableName> = InferSelectModel<(typeof tables)[T]>;
export type Insert<T extends TableName> = InferInsertModel<(typeof tables)[T]>;

export default defineSchema(tables)
  .relations((r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      gameSessions: r.many.gameSession({
        from: r.user.id,
        to: r.gameSession.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
        optional: false,
      }),
    },
    gameSession: {
      user: r.one.user({
        from: r.gameSession.userId,
        to: r.user.id,
        optional: false,
      }),
    },
  }))
  .triggers({
    // user: {
    //   delete: {
    //     before: async (user, ctx) => {
    //       // const userCaller = createUsersCaller(ctx);
    //       console.log(`check predelete -- ${user.id}`)
    //       for (const table of Object.values(tables)) {
    //         console.log(`check ${table.tableName} -- ${user.id}`)
    //         if ("userId" in table) {
    //           console.log(`relations ${table.tableName} -- ${user.id}`)
    //           // const relations = ctx.orm.query[table.tableName]._.tableConfig.relations;
    //           // if ("user" in relations && relations.user.relationType === "one") {
    //             console.log(`clear ${table.tableName} -- ${user.id}`)
    //             // ctx.orm.delete(table).where(eq(table.userId, user.id));
    //           // }
    //         }
    //       }
    //     },
    //   },
    // },
  });
