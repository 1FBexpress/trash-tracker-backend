import Fastify from 'fastify';
import cors from '@fastify/cors';
import { jobRoutes } from './routes/jobs';

const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576, // 1MB
});

async function start() {
  try {
    // CORS - allow all origins
    await fastify.register(cors, {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Health check
    fastify.get('/health', async () => ({ ok: true }));
    fastify.get('/', async () => ({ ok: true }));

    // API routes
    await fastify.register(jobRoutes, { prefix: '/api' });

    // Start
    const port = Number(process.env.PORT) || 10000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server ready at http://0.0.0.0:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
