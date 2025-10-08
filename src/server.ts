import fastify from 'fastify';
import cors from '@fastify/cors';
import { config as loadEnv } from 'dotenv';
import apiRoutes from './routes';

loadEnv();

const PORT = Number(process.env.PORT || 10000);
const HOST = '0.0.0.0';

const origins =
  (process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean)) ??
  ['http://localhost:3000', 'https://trash-tracker-frontend.onrender.com'];

async function start() {
  const app = fastify({ logger: true });

  await app.register(cors, { origin: origins });

  // Health + root
  app.get('/', async () => ({ ok: true }));
  app.get('/health', async () => ({ ok: true }));

  // API routes (jobs)
  app.register(apiRoutes, { prefix: '/api' });

  try {
    await app.listen({ host: HOST, port: PORT });
    app.log.info(`Server listening at http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
