import { Request, Response } from 'express';
import {
    otpSchema,
    updateAccountSchema,
    handleTwoFactorSchema,
    notificationsSchema,
} from '#/types/schemas';
import statusCodes from '~/constants/statusCodes';
import { getDriver } from '~/database/neo4j_setup';
import { redisClient } from '~/database/redis_setup';
import { parseZodBody } from '~/utils/zod.utils';
import { setupAuthTokens } from '~/utils/auth.utils';

export const upadteAccount = async (
    req: Request,
    res: Response
): Promise<Response> => {
    // Update account
    try {
        const result = parseZodBody(updateAccountSchema, req, res);

        if (!result.success) {
            return result.response;
        }
        const neo4jsesion = getDriver()?.session();

        const buildQuery = (data: object): string => {
            let query = 'SET ';
            const keys = Object.keys(data);
            keys.forEach((key, index) => {
                query += `u.${key} = $${key}`;
                if (index !== keys.length - 1) {
                    query += ', ';
                }
            });
            return query;
        };

        const records = await neo4jsesion.run(
            `
            Match (u:User {email: $stableemail})
            ${buildQuery(result.data)}
            RETURN u
            `,
            {
                stableemail: req.user?.email,
                ...result.data,
            }
        );

        if (records.records.length === 0) {
            return res.status(statusCodes.badRequest).json({
                message: 'Could not update account',
            });
        }

        const userData = records.records[0].get('u').properties;

        // Update account in database
        return res.status(statusCodes.success).json({
            message: 'Account updated',
            ...userData,
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const updateEmail = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();

        const result = parseZodBody(otpSchema, req, res);

        if (!result.success) {
            return result.response;
        }

        const { email: newEmail, otp } = result.data;

        const otpInRedis = await redisClient.get(`otp:${newEmail}`);

        // Check if email is already taken
        const checkUser = await neo4jsession.run(
            `
            Match (u:User {email: $email})
            RETURN u
            `,
            {
                email: newEmail,
            }
        );

        if (checkUser.records.length > 0) {
            return res.status(statusCodes.badRequest).json({
                message: 'Email already taken',
            });
        }

        if (otpInRedis === otp) {
            await redisClient.del(`otp:${newEmail}`);
            // email is verified now we can update the user in the database
            const result = await neo4jsession.run(
                `
                Match (u:User {email: $stableemail})
                SET u.email = $newEmail
                RETURN u
                `,
                {
                    stableemail: req.user?.email,
                    newEmail,
                }
            );
            const newUser = result.records[0].get('u').properties;
            if (!newUser) {
                return res.status(statusCodes.serverError).json({
                    message: 'Unable to update email',
                });
            }
            const { xsrfToken } = await setupAuthTokens(res, newUser);
            return res
                .status(statusCodes.success)
                .json({ message: 'Email Updated', xsrfToken });
        }

        return res.status(statusCodes.badRequest).json({
            message: 'Invalid OTP',
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const handleTwoFactorReq = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const result = parseZodBody(handleTwoFactorSchema, req, res);

    if (!result.success) {
        return result.response;
    }

    const { twoFactorEnabled } = result.data;
    const neo4jsesion = getDriver()?.session();
    const record = await neo4jsesion.run(
        `
        Match (u:User {email: $email})
        SET u.twoFactorEnabled = $twoFactorEnabled
        RETURN u
        `,
        {
            email: req.user?.email,
            twoFactorEnabled,
        }
    );

    if (record.records.length === 0) {
        return res.status(statusCodes.badRequest).json({
            message: 'Could not update two factor',
        });
    }

    const message = twoFactorEnabled
        ? 'Two factor enabled'
        : 'Two factor disabled';
    return res.status(statusCodes.success).json({
        message,
    });
};

export const updateNotifications = async (
    req: Request,
    res: Response
): Promise<Response | undefined> => {
    // Update notification settings
    try {
        const result = parseZodBody(notificationsSchema, req, res);

        if (!result.success) {
            return;
        }

        const neo4jsesion = getDriver()?.session();

        const { notifications } = result.data;
        await neo4jsesion.run(
            `
            Match (u:User {email: $email})
            SET u.notifications = $notifications
            `,
            {
                email: req.user?.email,
                notifications,
            }
        );

        // Update account in database
        return res.status(statusCodes.success).json({
            message: 'Notification settings updated',
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};
