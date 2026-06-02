import { getAuthConfigProvider } from 'kitcn/auth/config';
import type { AuthConfig } from 'convex/server';
import { getEnv } from '../lib/get-env';

const USERNAME_REGEX = /^[a-z1-9-]+$/;

export function validateUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export default {
  providers: [
    getEnv().JWKS
      ? getAuthConfigProvider({ jwks: getEnv().JWKS })
      : getAuthConfigProvider(),
  ],
} satisfies AuthConfig;
