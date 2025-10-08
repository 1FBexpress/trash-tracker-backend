import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createJobBody = z.object({
  title: z.string().min(1, 'title is required')
});

const updateJobBody = z.object({
  status: z.enum(['OPEN', 'ACCEPTED', 'REJECTED']).optional(),
  title: z.string().min(1).optional()
});

const jobsRoutes: FastifyPluginCallback = (app: FastifyInstance, _opts, done) => {
  // List jobs
  app.get('/jobs', async () => {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { jobs };
  });

  // Create job
  app.post('/jobs', async (req, reply) => {
    const parsed = createJobBody.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const job = await prisma.job.create({
      data: {
        title: parsed.data.title,
        status: 'OPEN'
      }
    });
    return { job };
  });

  // Update job (title or status)
  app.patch('/jobs/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateJobBody.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const job = await prisma.job.update({
      where: { id },
      data: parsed.data
    });
    return { job };
  });

  done();
};

export default jobsRoutes;
