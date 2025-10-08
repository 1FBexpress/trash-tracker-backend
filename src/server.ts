// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

function buildServer() {
  const app = Fastify({ logger: true });

  // CORS
  const origins =
    process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  app.register(cors, { origin: origins.length ? origins : true });

  // JWT only if configured
  if (process.env.JWT_SECRET) {
    app.register(fastifyJwt, { secret: process.env.JWT_SECRET });
  }

  // Routes
  app.get('/health', async () => ({ ok: true }));
  app.get('/', async () => ({ name: 'trash-tracker-api', status: 'running' }));

  return app;
}

async function start() {
  try {
    const app = buildServer();
    const port = Number(process.env.PORT || 3000);
    const host = '0.0.0.0'; // required on Render
    await app.listen({ port, host });
    app.log.info(`server listening on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
