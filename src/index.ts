import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { initializeRedis } from './utils/redis';
import sequelize from './utils/database';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from './swagger';

import 'dotenv/config';

interface ErrorWithStatus extends Error {
  status?: number;
}

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // DB initialization
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  // Redis initialization
  try {
    await initializeRedis();
    console.log('Connection to the redis has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to redis:', error);
  }

  
  try {

    // Swagger docs definition
    const options = {
      swaggerDefinition,
      apis: ['**/*.ts'],
    };

    const swaggerSpec = swaggerJSDoc(options);
    
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
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`You can view the documentation at http://localhost:${port}/docs`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();
