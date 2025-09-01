import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { RedisClient } from '../queue/redis';
import { config } from '../config/config';
import { logger } from '../utils/logger';

const rateLimiter = new RateLimiterRedis({
  storeClient: RedisClient.getInstance().getClient(),
  keyPrefix: 'middleware',
  points: config.security.rateLimitMaxRequests, // Number of requests
  duration: config.security.rateLimitWindowMs / 1000, // Per duration in seconds
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later.',
        retryAfter: Math.round((rejRes.msBeforeNext || 60000) / 1000),
      },
    });
  }
};

export { rateLimiterMiddleware as rateLimiter };
