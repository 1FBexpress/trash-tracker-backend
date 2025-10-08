import { z } from 'zod';
import { prisma } from '../db/client';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();
const authed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) throw new Error('UNAUTHENTICATED');
  return next({ ctx: { user: ctx.user } });
});

export const jobsRouter = t.router({
  create: t.procedure.use(authed).input(z.object({
    type: z.enum(['INSTANT','BID']),
    wasteType: z.string(),
    description: z.string().optional(),
    photos: z.array(z.string()).optional(),
    address: z.string(),
    pickupLat: z.number().optional(),
    pickupLng: z.number().optional(),
    scheduledAt: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const job = await prisma.job.create({ data: {
      type: input.type as any,
      wasteType: input.wasteType,
      description: input.description,
      photos: input.photos ?? [],
      address: input.address,
      pickupLat: input.pickupLat,
      pickupLng: input.pickupLng,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      status: 'REQUESTED',
      userId: ctx.user.userId,
    }});
    return job;
  }),

  availableForPicker: t.procedure.use(authed).query(async ({ ctx }) => {
    // TODO: filter by radius, capacity, KYC status
    return prisma.job.findMany({ where: { status: { in: ['REQUESTED','DISPATCHED'] } }, orderBy: { createdAt: 'desc' } });
  }),

  accept: t.procedure.use(authed).input(z.object({ jobId: z.string() })).mutation(async ({ input, ctx }) => {
    const job = await prisma.job.update({ where: { id: input.jobId }, data: { pickerId: ctx.user.userId, status: 'DISPATCHED' } });
    return job;
  }),

  updateStatus: t.procedure.use(authed).input(z.object({ jobId: z.string(), status: z.enum(['EN_ROUTE','ON_SITE','LOADED','AT_APPROVED_SITE','DROPPED','AWAIT_CONFIRM','COMPLETE','CANCELLED']) })).mutation(async ({ input }) => {
    return prisma.job.update({ where: { id: input.jobId }, data: { status: input.status } });
  }),
});