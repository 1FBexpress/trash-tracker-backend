import Fastify from 'fastify';
import cors from '@fastify/cors';
import { jobRoutes } from './routes/jobs';

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // CORS - allow all origins for now
    await fastify.register(cors, {
      origin: true,
    });

    // Explicitly register content type parser for JSON
    fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
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
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
