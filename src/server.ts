import fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
dotenv.config();

const app = fastify({ logger: true });

const origins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(s => s.trim())
  : ["*"];

async function register() {
  await app.register(cors, { origin: origins });
  app.get("/", async () => ({ ok: true }));
  app.get("/health", async () => ({ status: "ok" }));
}

async function main() {
  await register();
  const port = Number(process.env.PORT || 10000);
  await app.listen({ host: "0.0.0.0", port });
}

main().catch(err => {
  app.log.error(err);
  process.exit(1);
});
