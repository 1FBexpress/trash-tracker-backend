import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

const origins =
  process.env.CORS_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) ?? true;
await app.register(cors, { origin: origins });

app.get("/", async () => ({ ok: true }));
app.get("/health", async () => ({ status: "ok" }));

app.get("/jobs", async () => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  return { jobs };
});

app.post("/jobs", async (req, reply) => {
  const body = (req.body ?? {}) as any;
  const title = typeof body.title === "string" && body.title.trim() ? body.title : "Untitled";
  const job = await prisma.job.create({ data: { title } });
  reply.code(201);
  return { job };
});

const port = Number(process.env.PORT || 10000);
app.listen({ host: "0.0.0.0", port }).then(() => {
  app.log.info(`Server listening on ${port}`);
});

