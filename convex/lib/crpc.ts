import { getAuthUserIdentity } from 'kitcn/auth';
import { CRPCError } from 'kitcn/server';

import { initCRPC } from '../functions/generated/server';
import { MarkNonNull } from '../../lib/types';
import { iHateNull } from './document';

export const c = initCRPC
  .meta<{
    auth?: 'optional' | 'required';
    game?: 'optional' | 'required';
  }>()
  .create();

const optionalAuthMiddleware = c.middleware(async ({ ctx, next }) => {
  // console.log('check optional auth!')
  const identity = await getAuthUserIdentity(ctx);
  // console.log('check optional auth! identity=', identity)
  if (!identity) return next({ ctx: { ...ctx, user: null as typeof user } });
  // console.log('check optional auth! find user')
  const user = iHateNull(
    await ctx.orm.query.user.findFirst({
      where: { id: identity.subject },
    }),
    true
  );
  // console.log(`check optional auth! identity=${identity.name ?? "none"} user=${user?.username ?? "none"}`)
  if (!user) return next({ ctx: { ...ctx, user: null as typeof user } });
  // console.log('check optional auth! forward user')
  return next({ ctx: { ...ctx, user } });
});

export const authMiddleware = optionalAuthMiddleware.pipe(
  async ({ ctx, next }) => {
    if (!ctx.user) throw new CRPCError({ code: 'UNAUTHORIZED' });
    return next({ ctx: ctx as MarkNonNull<typeof ctx, 'user'> });
  }
);

export const publicQuery = c.query;
export const publicAction = c.action;
export const publicMutation = c.mutation;

export const privateQuery = c.query.internal();
export const privateMutation = c.mutation.internal();
export const privateAction = c.action.internal();

export const optionalAuthQuery = c.query
  .meta({ auth: 'optional' })
  .use(optionalAuthMiddleware);

export const authQuery = c.query.meta({ auth: 'required' }).use(authMiddleware);

export const optionalAuthMutation = c.mutation
  .meta({ auth: 'optional' })
  .use(optionalAuthMiddleware);

export const authMutation = c.mutation
  .meta({ auth: 'required' })
  .use(authMiddleware);

export const authAction = c.action
  .meta({ auth: 'required' })
  .use(authMiddleware);

export const publicRoute = c.httpAction;
export const authRoute = c.httpAction.use(authMiddleware);
export const optionalAuthRoute = c.httpAction.use(optionalAuthMiddleware);
export const router = c.router;
