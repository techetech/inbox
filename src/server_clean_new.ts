import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
// import { rateLimiter } from './middleware/rateLimiter'; // Temporarily disabled
import { authRoutes } from './routes/auth';
import { mailRoutes } from './routes/mail';
import { adminRoutes } from './routes/admin';
import { Database } from './database/connection';
// import { RedisClient } from './queue/redis'; // Temporarily disabled
// import { initializeQueues } from './queue/queues'; // Temporarily disabled

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
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting middleware (temporarily disabled)
    // TODO: Re-enable rate limiter after fixing Redis compatibility
    // this.app.use('/api', rateLimiter);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/mail', mailRoutes);
    this.app.use('/api/admin', adminRoutes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await Database.getInstance().connect();
      logger.info('Database connected successfully');

      // Initialize Redis (temporarily disabled)
      // await RedisClient.getInstance().connect();
      // logger.info('Redis connected successfully');

      // Initialize background queues (temporarily disabled)
      // await initializeQueues();
      // logger.info('Background queues initialized');
      logger.info('Redis and queues temporarily disabled');

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

export default Server;
