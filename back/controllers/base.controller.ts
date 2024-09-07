import { contactSchema, emailSchema } from '#/types/schemas';
import { Request, Response } from 'express';
import statusCodes from '~/constants/statusCodes';
import { ContactMessage } from '~/models/contact.model';
import subscriptionModel from '~/models/subscription.model';
import newslettersubModel from '~/models/newslettersub.model';
import { parseZodBody } from '~/utils/zod.utils';

export const contact = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(contactSchema, req, res);
        if (!result.success) {
            return result.response;
        }
        // Send email to admin

        // save message to database
        const { name, email, message } = result.data;
        const newMessage = new ContactMessage({
            name,
            email,
            message,
        });

        await newMessage.save();

        return res.status(statusCodes.success).json({
            message: 'Message sent',
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const getPlans = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    // Get plans from database
    const plans = await subscriptionModel.find();
    return res.status(statusCodes.success).json({
        plans,
    });
};

export const getPlan = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { slug } = req.params;
        const subscription = await subscriptionModel.findOne({ slug });
        if (!subscription) {
            return res.status(statusCodes.notFound).json({
                message: 'Plan not found',
            });
        }
        return res.status(statusCodes.success).json(subscription);
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};
export const subscribeToNewsletter = async (
    req: Request,
    res: Response
): Promise<Response> => {
    // subscribe to newsletter

    const result = parseZodBody(emailSchema, req, res);
    if (!result.success) {
        return result.response;
    }
    const { email } = result.data;

    const existingNewsletterSubscriber = await newslettersubModel.findOne({
        email,
    });
    if (existingNewsletterSubscriber) {
        return res.status(statusCodes.success).json({
            message: 'Already subscribed',
        });
    }

    const newNewsletterSubscriber = new newslettersubModel({
        email,
    });

    await newNewsletterSubscriber.save();

    return res.status(statusCodes.success).json({
        message: 'Subscribed to newsletter',
    });
};

export const unsubscribeFromNewsletter = async (
    req: Request,
    res: Response
): Promise<Response> => {
    // unsubscribe from newsletter

    try {
        const result = parseZodBody(emailSchema, req, res);
        if (!result.success) {
            return result.response;
        }
        const { email } = result.data;

        const existingSubscriber = await subscriptionModel.findOne({ email });
        if (!existingSubscriber) {
            return res.status(statusCodes.success).json({
                message: 'Not subscribed',
            });
        }

        await existingSubscriber.deleteOne();

        return res.status(statusCodes.success).json({
            message: 'Unsubscribed from newsletter',
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};
