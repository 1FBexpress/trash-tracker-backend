// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

const app = Fastify({ logger: true });

// ----- CORS (allow specific origins or all if not set)
const origins =
  process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
await app.register(cors, {
  origin: origins.length ? origins : true,
});

// ----- JWT (optional – only if secret provided)
if (process.env.JWT_SECRET) {
  await app.register(fastifyJwt, { secret: process.env.JWT_SECRET });
}

// ----- Healthcheck
app.get('/health', async () => ({ ok:
