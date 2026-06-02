import { anonymous, username } from "better-auth/plugins"

import { convex } from 'kitcn/auth';
import { getEnv } from '../lib/get-env';
import authConfig, { validateUsername } from './auth.config';
import { defineAuth, getAuth } from './generated/auth';

export default defineAuth(() => ({
  emailAndPassword: {
    enabled: true,
  },
  baseURL: getEnv().SITE_URL,
  plugins: [
    convex({
      authConfig,
      jwks: getEnv().JWKS,
    }),
    username({
      minUsernameLength: 3,
      usernameValidator: validateUsername,
      schema: {
        user: {
          fields: {
            username: "username",
            displayUsername: "displayUsername",
          },
        },
      },
    }),
    anonymous({
      emailDomainName: 'guest.gambling.ammu.com',
      generateName: async () =>
        `guest-gambler-${Math.random().toString(36).slice(2, 10)}`,
      onLinkAccount: async ({ anonymousUser, newUser, ctx: linkCtx }) => {
        // console.log({anonymousUser,newUser})
        const updatedUser = Object.assign({...newUser.user}, anonymousUser.user);
        const omittedKeys = ["id", "isAnonymous", "email", "name", "username"] as const;
        for (const key of omittedKeys) {
          delete updatedUser[key];
        }
        // console.log(updatedUser);
        await linkCtx.context.internalAdapter.updateUser(newUser.user.id, {...newUser.user, ...updatedUser});
        await linkCtx.context.internalAdapter.deleteSession(anonymousUser.session.token);
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 15,
  },
  telemetry: { enabled: false },
  trustedOrigins: [getEnv().SITE_URL],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.isAnonymous || !user.username) {
            return {
              data: {
                ...user, 
                username: user.name,
              },
            };
          }
        }
      }
    }
  }
}));
