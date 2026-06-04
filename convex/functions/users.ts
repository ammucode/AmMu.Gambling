import { z } from 'zod';

import { optionalAuthQuery, publicMutation, publicQuery } from '../lib/crpc';
import { messagesTable } from './schema';
import { createDoc, iHateNull } from '../lib/document';
import {
  userPrivateInfo,
  userPrivateInfoColumns,
  userPrivateInfoColumnsFilter,
} from '../shared/models';

export const me = optionalAuthQuery.query(async ({ ctx }) => ctx.user);

export const getOwnInfo = optionalAuthQuery
  .input(
    z.object({
      username: z.string(),
    })
  )
  .output(userPrivateInfo.nullish())
  .query(async ({ ctx, input: { username } }) => {
    return iHateNull(
      await ctx.orm.query.user.findFirst({
        where: { username },
        columns: userPrivateInfoColumnsFilter,
      })
    );
  });
