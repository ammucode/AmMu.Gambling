import { optionalAuthQuery } from '@convex-lib/crpc';
import { userPrivateInfo } from '../shared/models';

export const me = optionalAuthQuery
  .output(userPrivateInfo.nullable())
  .query(
    async ({ ctx }) => await userPrivateInfo.nullable().parseAsync(ctx.user)
  );
