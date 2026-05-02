import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { pingMysql, closeMysql } from './config/db-mysql.js';
import { connectMongo, disconnectMongo } from './config/db-mongo.js';

async function bootstrap() {
  await pingMysql();
  await connectMongo();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, aiMock: env.AI_USE_MOCK },
      'Backend listening'
    );
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down');
    server.close(() => logger.info('HTTP server closed'));
    await closeMysql().catch((e) => logger.error(e, 'MySQL close failed'));
    await disconnectMongo().catch((e) => logger.error(e, 'Mongo close failed'));
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'unhandledRejection'));
  process.on('uncaughtException', (err) => logger.error({ err }, 'uncaughtException'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Fatal startup error');
  process.exit(1);
});
