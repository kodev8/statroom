import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import statusCodes from '~/constants/statusCodes';
import logger from './winston';
import tokenBlacklistModel from '~/models/tokenBlacklist.model';

const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        // console.log(tokenBlacklistModel);
        // const cookieToken = (req.header('Authorization') as string)?.split(' ')[1];
        // console.log(cookieToken);

        const xsrfToken = req.headers['x-xsrf-token'] as string;
        const cookieToken = req.cookies['token'];

        if (!xsrfToken || !cookieToken) {
            logger.error('No Authentication token provided');
            return res
                .status(statusCodes.unauthorized)
                .json({ error: 'Invalid token' });
        }
        if (await tokenBlacklistModel.findOne({ token: cookieToken })) {
            logger.error('Token blacklisted');
            return res
                .status(statusCodes.unauthorized)
                .json({ error: 'Invalid token' });
        }

        const decodedXsrfToken = jwt.verify(
            xsrfToken,
            process.env.JWT_SECRET_KEY as string
        ) as jwt.UserJwtPayload & { xsrfToken: string };

        const decodedUser = jwt.verify(
            cookieToken,
            process.env.JWT_SECRET_KEY as string
        ) as jwt.UserJwtPayload;

        if (decodedXsrfToken.xsrfToken !== decodedUser.xsrfToken) {
            return res
                .status(statusCodes.unauthorized)
                .json({ error: 'Invalid token' });
        }

        req.user = decodedUser.user;

        next();
    } catch (error) {
        logger.error(error);
        logger.error(error);
        return res
            .status(statusCodes.unauthorized)
            .json({ error: 'Invalid token' });
    }
};

export default verifyToken;
