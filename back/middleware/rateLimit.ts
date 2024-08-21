import logger from '~/middleware/winston';
import statusCodes from '~/constants/statusCodes';
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '~/database/redis_setup';

export default function rateLimit(expireSeconds: number, maxRequests: number) {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        const ip = req.ip ?? req.socket.remoteAddress;
        const key = `rate-limit:${req.path}:${ip}`;
        try {
            const count = await redisClient.incr(key);
            if (count === 1) {
                redisClient.expire(key, expireSeconds);
            }
            if (count > maxRequests) {
                return res
                    .status(statusCodes.tooManyRequests)
                    .json({ message: 'Too many requests. Try again later.' });
            }
            next();
        } catch (err) {
            logger.error('Rate limit error: ', err);
            return res
                .status(statusCodes.serverError)
                .send('Internal server error');
        }
    };
}
