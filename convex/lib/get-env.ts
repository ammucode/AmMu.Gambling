import { createEnv } from 'kitcn/server';
import { z } from 'zod';

const envSchema = z.object({
  DEPLOY_ENV: z.enum(['production', 'development']).default('production'),
  SITE_URL: z.string().default('http://localhost:3001'),
  DEV_NETWORK_SITE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  JWKS: z.string().optional(),
  CONVEX_SITE_URL: z.string().optional(),
});

export const getEnv = createEnv({
  schema: envSchema,
});

export function getSiteURLs() {
  const env = getEnv();
  const urls = [env.SITE_URL];
  if (env.DEV_NETWORK_SITE_URL) urls.push(env.DEV_NETWORK_SITE_URL);
  else if (env.DEPLOY_ENV === 'development') urls.push('http://10.0.0.84:3001');
  // console.log(urls.map(origin => origin.split('://')[1]))
  return urls;
}
