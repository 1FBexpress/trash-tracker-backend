import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify();

const origins =
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['*'];

async function start() {
  await app.register(cors, { origin: origins });

  app.get('/', async () => ({ ok: true }));
  app.get('/health', async () => ({ status: 'ok' }));

  const port = Number(process.env.PORT || 10000);
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`server listening on http://0.0.0.0:${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
