import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import jobsRoutes from './jobs';

const apiRoutes: FastifyPluginCallback = (app: FastifyInstance, _opts, done) => {
  app.register(jobsRoutes);
  done();
};

export default apiRoutes;
