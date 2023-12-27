import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';
import 'dotenv/config';

let redisClient: RedisClientType;

// Initialization of REDIS
async function initializeRedis() {
    redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    });
  
    redisClient.on('error', (err) => console.error('Redis client error', err));
  
    await redisClient.connect();
}

async function closeRedisConnection() {
    await redisClient.quit();
}

// Middleware to check cache
const checkCache = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
  
    try {
      const cachedData = await redisClient.get(`user_${id}`);
      
      if (cachedData != null) {
        return res.status(200).send(JSON.parse(cachedData));
      }

      return next();

    } catch (err) {
      console.error('Redis error:', err);
      return next(err);
    }
};

// Middleware to set cache
const setCache = (req: Request, res: Response) => {
    const { id } = req.params;
    const user = res.locals.user;

    // Caches the user and sends the response
    if (user) {
        redisClient.setEx(`user_${id}`, 60 * 60, JSON.stringify(user))
            .catch((err) => {
                console.error('Redis error in setCache:', err)
            });
    }

    res.status(200).json(user);
};


// Middleware the delete cache
export const invalidateCache = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        await redisClient.del(`user_${id}`);
        return next();
    } catch (err) {
        console.error('Redis error:', err);
        return next(err);
    }
};

export { redisClient, initializeRedis, checkCache, setCache, closeRedisConnection };