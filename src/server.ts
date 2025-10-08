import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

async function main() {
  const app = Fastify();
  const prisma = new PrismaClient();

  const origins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'https://trash-tracker-frontend.onrender.com'];

  await app.register(cors, { origin: origins });

  // Health
  app.get('/health', async () => ({ ok: true }));

  // DB routes
  app.get('/api/jobs', async () => {
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    return { jobs };
  });

  app.post<{ Body: { title: string } }>('/api/jobs', async (req, reply) => {
    const { title } = req.body ?? {};
    if (!title || !title.trim()) {
      reply.code(400);
      return { error: 'title is required' };
    }
    const job = await prisma.job.create({
      data: { title: title.trim(), status: 'OPEN' },
    });
    return { job };
  });

  // Root
  app.get('/', async () => ({ ok: true }));

  const port = Number(process.env.PORT || 10000);
  await app.listen({ host: '0.0.0.0', port });
  console.log(`server listening on http://0.0.0.0:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
