import * as redis from 'redis';
import RedisStore from 'connect-redis';
import logger from '~/middleware/winston';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URI = process.env.REDIS_URI;
if (!REDIS_URI) {
    logger.error('Redis URI is not provided');
    process.exit(1);
}
const redisClient = redis.createClient({
    url: REDIS_URI,
});

const connectToRedis = async (): Promise<void> => {
    redisClient.on('error', (err) => {
        logger.error('Redis error: ', err);
        throw new Error('Redis connection error');
    });

    redisClient.on('connect', () => {
        logger.info('Redis connected successfully');
    });

    await redisClient.connect();
};

export { RedisStore, connectToRedis, redisClient };
