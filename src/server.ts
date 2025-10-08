import Fastify from 'fastify';
import helmet from 'fastify-helmet';
import cors from 'fastify-cors';
import rateLimit from 'fastify-rate-limit';
import { appRouter, type Context } from './routers';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { env } from './env';
import { verifyJwt } from './auth/jwt';

const app = Fastify({ logger: true });

app.register(helmet as any);
app.register(cors as any, { origin: (origin: string, cb: Function) => {
  if (!origin) return cb(null, true);
  if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
  cb(new Error('Not allowed'), false);
}});
app.register(rateLimit as any, { max: 200, timeWindow: '1 minute' });

const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext: ({ req }): Context => {
    const auth = (req.headers['authorization'] as string | undefined);
    if (auth?.startsWith('Bearer ')) {
      try {
        const token = auth.substring(7);
        const user = verifyJwt(token, process.env.JWT_SECRET!);
        return { user: user as any };
      } catch {}
    }
    return {};
  },
});

app.all('/trpc/*', async (req, reply) => {
  await trpcHandler(req.raw as any, reply.raw as any);
});

const port = process.env.PORT || 3000;
app.listen({ port: Number(port), host: '0.0.0.0' });