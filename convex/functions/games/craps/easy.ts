import { Points } from '@/lib/games/craps';
import { pathFromGameSessionKey, sessionKeyForGame } from '@/lib/games/games';
import { c } from '@convex-lib/crpc';
import { gameMiddlewareFor, gameMutation, gameQuery } from '@convex-lib/crpc-games';
import { iHateNull } from '@convex-lib/document';
import { CRPCError } from 'kitcn/server';
import z from 'zod';



const easyCrapsQuery = gameQuery.use(gameMiddlewareFor("craps/easy"));
const easyCrapsMutation = gameMutation.use(gameMiddlewareFor("craps/easy"));

export const getPoint = easyCrapsQuery
  .output(z.union(Points.map(point => z.literal(point))).nullable())
  .query(async ({ ctx }) => {
    return iHateNull(ctx.gameDoc.point, true);
  });

export const betPassline = gameMutation
  .input(z.object({ amount: z.number().positive() }))
  .mutation(async ({ ctx, input }) => {});
