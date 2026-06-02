import { username } from "better-auth/plugins"

import { convex } from 'kitcn/auth';
import { getEnv } from '../lib/get-env';
import authConfig, { validateUsername } from './auth.config';
import { defineAuth } from './generated/auth';

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
    })
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 15,
  },
  telemetry: { enabled: false },
  trustedOrigins: [getEnv().SITE_URL],
}));
