import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['pending', 'assigned', 'done']).optional(),
  pickerId: z.string().nullable().optional(),
});

export async function jobRoutes(fastify: FastifyInstance) {
  // GET /api/jobs - List all jobs
  fastify.get('/jobs', async (request, reply) => {
    try {
      const jobs = await prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return reply.send(jobs);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch jobs' });
    }
  });

  // POST /api/jobs - Create a job
  fastify.post('/jobs', async (request, reply) => {
    try {
      const body = createJobSchema.parse(request.body);
      const job = await prisma.job.create({
        data: { title: body.title },
      });
      return reply.status(201).send(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create job' });
    }
  });

  // PATCH /api/jobs/:id - Update a job
  fastify.patch('/jobs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = updateJobSchema.parse(request.body);

      const job = await prisma.job.update({
        where: { id },
        data: body,
      });
      return reply.send(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      if ((error as any).code === 'P2025') {
        return reply.status(404).send({ error: 'Job not found' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update job' });
    }
  });
}
