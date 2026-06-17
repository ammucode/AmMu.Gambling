import { anonymous, username } from 'better-auth/plugins';

import { convex } from 'kitcn/auth';
import { getEnv, getSiteURLs } from '../lib/get-env';
import authConfig from './auth.config';
import { defineAuth } from './generated/auth';
import { usernameSchema } from '../lib/validators';
import { createGamesControlCaller } from './generated/games/control.runtime';
import { createUsersCaller } from './generated/users.runtime';
import { isMutationCtx } from 'kitcn/server';
import { gameSessionTable, userTable } from '~schema';
import { eq } from 'kitcn/orm';

export default defineAuth((ctx) => ({
  emailAndPassword: {
    enabled: true,
  },
  // baseURL: {
  //   protocol: "http",
  //   allowedHosts: ["localhost:3001","10.0.0.84:3001"],
  //   // allowedHosts: getSiteURLs().map(origin => origin.split('://')[1]),
  //   // fallback: "http://10.0.0.84:3001",
  //   fallback: "http://localhost:3001",
  //   // fallback: getEnv().SITE_URL,
  // },
  baseURL: {
    allowedHosts: getSiteURLs().map((origin) => origin.split('://')[1]),
    // allowedHosts: [getEnv().SITE_URL.split("://")[1]],
    // fallback: "http://10.0.0.84:3001",
    fallback: getEnv().SITE_URL,
  },
  // baseURL: getEnv().SITE_URL,
  // logger: {
  //   level: "debug",
  // },
  user: {
    additionalFields: {
      username: {
        // make username required
        type: 'string',
        required: true,
      },
      isAnonymous: {
        // make isAnonymous required
        type: 'boolean',
        required: true,
      },
    },
  },
  plugins: [
    convex({
      authConfig,
      jwks: getEnv().JWKS,
    }),
    username({
      minUsernameLength: 3,
      usernameValidator: usernameSchema.validator,
      schema: {
        user: {
          fields: {
            username: 'username',
            displayUsername: 'displayUsername',
          },
        },
      },
    }),
    anonymous({
      generateRandomEmail: async () =>
        `gambler-${Math.random().toString(36).slice(2, 10)}@guest.gambling.ammu.com`,
      onLinkAccount: async ({ anonymousUser, newUser, ctx: linkCtx }) => {
        // console.log({anonymousUser,newUser})
        const updatedUser = Object.assign(
          { ...newUser.user },
          anonymousUser.user
        );

        const omittedKeys = [
          'id',
          'name',
          'email',
          'emailVerified',
          'image',
          'createdAt',
          'updatedAt',
          'userId',
          'username',
          'displayUsername',
          'isAnonymous',
        ] as const;
        for (const key of omittedKeys) {
          delete updatedUser[key];
        }
        // console.log(updatedUser);
        await linkCtx.context.internalAdapter.updateUser(newUser.user.id, {
          ...newUser.user,
          ...updatedUser,
        });
        await linkCtx.context.internalAdapter.deleteSession(
          anonymousUser.session.token
        );
      },
    }),
  ],
  disabledPaths: ['/sign-in/email'],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 15,
  },
  telemetry: { enabled: false },
  // trustedOrigins: ["http://localhost:3001","http://10.0.0.84:3001"],
  trustedOrigins: getSiteURLs(),
  // trustedOrigins: [getEnv().SITE_URL],
  // advanced: {
  //   disableOriginCheck: true,
  // },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const newFields: Record<string, unknown> = {};
          if (user.isAnonymous === undefined) {
            newFields.isAnonymous = false;
          }
          if (user.isAnonymous) {
            newFields.username = user.email.split('@')[0];
            newFields.name = newFields.username;
            newFields.displayUsername = 'Gambling Guest';
          } else {
            newFields.displayUsername = user.username;
          }
          return {
            data: {
              ...user,
              ...newFields,
            },
          };
        },
      },
      // delete: {
      //   before: async (user) => {
      //     console.log("before delete from auth -- ", user);
      //     if (isMutationCtx(ctx)) {
      //       await ctx.orm.delete(gameSessionTable).where(eq(gameSessionTable.userId, user.id));
      //       // ctx.runMutation(createUsersCaller(ctx).predelete());
      //     }
      //   },
      // },
    },
  },
  // hooks: {
  //   after: createAuthMiddleware({}, async (ctx) => {

  //   }),
  // },
}));
