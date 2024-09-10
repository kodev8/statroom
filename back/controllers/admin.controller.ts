import { Request, Response } from 'express';
import { ContactMessage } from '~/models/contact.model';
import statusCodes from '~/constants/statusCodes';
import logger from '~/middleware/winston';

export const getContactMessages = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    try {
        const messages = await ContactMessage.find();
        return res.status(statusCodes.success).json(messages);
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Unable to fetch contact messages',
        });
    }
};
