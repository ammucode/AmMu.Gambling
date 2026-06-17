import { authMutation, optionalAuthQuery } from '@convex-lib/crpc';
import {
  userPrivateInfo,
  userPrivateInfoColumnsFilter,
} from '../shared/models';
import z from 'zod';
import { iHateNull } from '@convex-lib/document';

export const me = optionalAuthQuery
  .input(z.object({ id: z.string().optional() }))
  .output(userPrivateInfo.nullable())
  .query(async ({ ctx, input }) => {
    // const identity = await ctx.auth.getUserIdentity();
    // console.log('get me', ctx.user, identity);
    return (
      (await userPrivateInfo.nullable().parseAsync(ctx.user)) ??
      (input.id
        ? null
        // iHateNull(
        //     await ctx.orm.query.user.findFirst({
        //       where: {
        //         id: input.id,
        //       },
        //       columns: userPrivateInfoColumnsFilter,
        //     }),
        //     true
        //   )
        : null)
    );
  });

// export const predelete = authMutation
//   .mutation
