import { Request, Response } from 'express';
import notificationModel from '~/models/notification.model';
import statusCodes from '~/constants/statusCodes';
import { getDriver } from '~/database/neo4j_setup';
import { QueryResult, RecordShape } from 'neo4j-driver';
import logger from '~/middleware/winston';

export const getActivity = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const notifications = await notificationModel
            .find({
                $and: [
                    { recipient: req.user?.email }, // each condition is an object
                    { resolution: { $ne: 'deleted' } }, // $ne condition is properly nested
                ],
            })
            .sort({ createdAt: 'desc' });

        return res.status(statusCodes.success).json(notifications);
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ error: 'Internal server error' });
    }
};

export const resolveAction = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { resolution } = req.body;
        const notification = await notificationModel.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user?.email,
            },
            {
                resolution,
                seen: true,
            },
            { new: true }
        );

        if (!notification) {
            return res
                .status(statusCodes.notFound)
                .json({ error: 'Notification not found' });
        }

        if (
            resolution === 'approved' &&
            notification.type === 'team_access_request'
        ) {
            await addTeamMember(notification.data.teamId, notification.sender);
        }

        return res.status(statusCodes.success).json(notification);
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ error: 'Internal server error' });
    }
};

export const resolveSeen = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { read } = req.body;
        const notification = await notificationModel.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user?.email,
            },
            {
                seen: read,
            },
            { new: true }
        );

        if (!notification) {
            return res
                .status(statusCodes.notFound)
                .json({ error: 'Notification not found' });
        }

        return res.status(statusCodes.success).json(notification);
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ error: 'Internal server error' });
    }
};

const addTeamMember = async (
    teamId: string,
    email: string
): Promise<QueryResult<RecordShape>> => {
    const neo4jsession = getDriver()?.session();
    const query = `
        MATCH (t:Team) WHERE ID(t) = toInteger($teamId)
        MERGE (u:User {email: $email})
        MERGE (u)-[:MEMBER_OF {role: 'viewer'}]->(t)
        RETURN u, t
    `;
    const result = await neo4jsession?.run(query, { teamId, email });
    const records = result?.records;

    if (!records || records.length === 0) {
        throw new Error('Error adding team member');
    }
    return result;
};
