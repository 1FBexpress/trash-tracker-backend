import { prisma } from '../db/client';
import { initTRPC } from '@trpc/server';
const t = initTRPC.create();

export const landfillsRouter = t.router({
  list: t.procedure.query(() => prisma.landfill.findMany()),
});