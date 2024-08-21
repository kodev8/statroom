import { Request, Response, NextFunction } from 'express';
import statusCodes from '~/constants/statusCodes';
const adminProtected = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        // Check if user is an admin
        if (!req.user?.isAdmin) {
            return res.status(statusCodes.unauthorized).json({
                message: 'Unauthorized',
            });
        }

        next();
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export default adminProtected;
