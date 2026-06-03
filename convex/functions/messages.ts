import { z } from 'zod';

import { publicMutation, publicQuery } from '../lib/crpc';
import { messagesTable } from './schema';
import { createDoc } from '../lib/document';

export const list = publicQuery
  .output(
    z.array(
      z.object({
        id: z.string(),
        body: z.string(),
        createdAt: z.date(),
      })
    )
  )
  .query(async ({ ctx }) => {
    return await ctx.orm.query.messages.findMany({
      columns: {
        id: true,
        body: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      limit: 10,
    });
  });

export const create = publicMutation
  .input(
    z.object({
      body: z.string().trim().min(1).max(120),
    })
  )
  // .output()
  .mutation(
    async ({ ctx, input }) =>
      await ctx.orm.insert(messagesTable).values(
        createDoc({
          body: input.body,
        })
      )
  );
