export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean),
};