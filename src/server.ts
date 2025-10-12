import Fastify from 'fastify';
import { jobRoutes } from './routes/jobs';

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // Add CORS headers manually to every response
    fastify.addHook('onRequest', async (request, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (request.method === 'OPTIONS') {
        reply.code(200).send();
      }
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
