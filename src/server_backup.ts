import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authRoutes } from './routes/auth';
import { mailRoutes } from './routes/mail';
import { adminRoutes } from './routes/admin';
import { Database } from './database/connection';
import { RedisClient } from './queue/redis';
import { initializeQueues } from './queue/queues';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors(config.cors));
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(rateLimiter);
  }

  private initializeRoutes(): void {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/mail', mailRoutes);
    this.app.use('/api/admin', adminRoutes);
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await Database.getInstance().connect();
      logger.info('Database connected successfully');

      // Initialize Redis
      // TODO: Fix Redis compatibility issue with BullMQ/Lua scripts
      // await RedisClient.getInstance().connect();
      logger.info('Redis temporarily disabled');

      // Initialize background queues
      // TODO: Fix BullMQ Redis Lua script compatibility issue
      // await initializeQueues();
      logger.info('Background queues temporarily disabled');

      this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${config.server.env}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  logger.error('Unhandled server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Shutting down gracefully...');
  process.exit(0);
});
