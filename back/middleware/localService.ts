import { Request, Response, NextFunction } from 'express';
import statusCodes from '~/constants/statusCodes';

const localServiceProtect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        const localServiceKey = process.env.LOCAL_SERVICE_KEY ?? '';
        if (req.headers['x-local-service-key'] !== localServiceKey) {
            return res
                .status(statusCodes.unauthorized)
                .json({ message: 'access denied' });
        }
        next();
    } catch (_error) {
        return res
            .status(statusCodes.serverError)
            .json({ message: 'an unexpected error occered' });
    }
};

export default localServiceProtect;
