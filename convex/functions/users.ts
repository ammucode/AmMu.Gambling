import { z } from 'zod';

import { optionalAuthQuery } from '../lib/crpc';

export const me = optionalAuthQuery.query(async ({ ctx }) => ctx.user);
