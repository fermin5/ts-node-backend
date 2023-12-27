/// <reference path="../../src/custom.d.ts" />
import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { initializeRedis, closeRedisConnection } from '../../src/utils/redis';
import sequelize from '../../src/utils/database';
import routes from '../../src/routes';

import 'dotenv/config';

interface ErrorWithStatus extends Error {
  status?: number;
}

async function startServer(): Promise<{ app: Express; close: () => Promise<void> }> {
  const app = express();
  const port = process.env.PORT || 3000;

  // DB initialization
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw new Error('Unable to connect to the database');
  }

  // Redis initialization
  try {
    await initializeRedis();
    console.log('Connection to Redis has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to Redis:', error);
    throw new Error('Unable to connect to Redis');
  }

  app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    origin: true
  }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Routes handler
  app.use('/api', routes);

  // 404 Error handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    const err: ErrorWithStatus = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Error handler
  app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: {
        status: err.status,
        message: err.message
      }
    });
  });

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return {
    app,
    close: async (): Promise<void> => {
      server.close(() => {
        console.log('HTTP server closed');
      });

      await sequelize.close();
      console.log('Database connection has been closed successfully.');

      await closeRedisConnection();
      console.log('Redis connection has been closed successfully.');
    },
  };
}

export { startServer };
