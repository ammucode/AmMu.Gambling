import { getSiteURLs } from '../lib/get-env';
import { getAuth } from './generated/auth';
import { cors } from 'hono/cors';
import { authMiddleware } from 'kitcn/auth/http';
import { createHttpRouter } from "/Users/amandashe/Documents/ammucode/AmMu.Gambling/node_modules/.kitcn/project-jiti-server-shim.mjs";
import { Hono } from 'hono';
import { router } from '@convex-lib/crpc';
// __KITCN_HTTP_IMPORTS__

const app = new Hono();

app.use(
  '/api/*',
  cors({
    // origin: getEnv().SITE_URL,
    origin: getSiteURLs(),
    allowHeaders: ['Content-Type', 'Authorization', 'Better-Auth-Cookie'],
    exposeHeaders: ['Set-Better-Auth-Cookie'],
    credentials: true,
  })
);

app.use(authMiddleware(getAuth));

export const httpRouter = router({
  // __KITCN_HTTP_ROUTES__
});

export default createHttpRouter(app, httpRouter);
