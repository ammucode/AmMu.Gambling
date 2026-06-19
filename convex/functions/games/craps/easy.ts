import { Points } from '@/lib/games/craps';
import { perGameTableResult_CRPCDefs } from '@convex-lib/crpc-games';
import { iHateNull } from '@convex-lib/document';
import z from 'zod';

const { query: easyCrapsQuery, mutation: easyCrapsMutation } =
  perGameTableResult_CRPCDefs['craps/easy'];

export const getPoint = easyCrapsQuery
  .output(z.union(Points.map((point) => z.literal(point))).nullable())
  .query(async ({ ctx }) => {
    return iHateNull(ctx.gameDoc.easyCrapsSession[0].point, true);
  });

export const betPassline = easyCrapsMutation
  .input(z.object({ amount: z.number().positive() }))
  .mutation(async ({}) => {});
