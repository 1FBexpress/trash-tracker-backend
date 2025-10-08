import { initTRPC } from '@trpc/server';
import { jobsRouter } from './jobs';
import { landfillsRouter } from './landfills';

const t = initTRPC.context<Context>().create();

export type Context = {
  user?: { userId: string; role: 'USER'|'PICKER'|'ADMIN' };
};

export const appRouter = t.router({
  jobs: jobsRouter,
  landfills: landfillsRouter,
});

export type AppRouter = typeof appRouter;