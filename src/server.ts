import Fastify from 'fastify';
import cors from '@fastify/cors';
import { jobRoutes } from './routes/jobs';

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // CORS
    const corsOrigins = process.env.CORS_ORIGINS || '*';
    await fastify.register(cors, {
      origin: corsOrigins === '*' ? true : corsOrigins.split(',').map(o => o.trim()),
    });

    // Health check
    fastify.get('/health', async () => ({ ok: true }));
    fastify.get('/', async () => ({ ok: true }));

    // API routes
    await fastify.register(jobRoutes, { prefix: '/api' });

    // Start
    const port = Number(process.env.PORT) || 10000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
