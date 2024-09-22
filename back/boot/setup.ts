import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';

// routes imports
import authRoutes from '~/routes/auth.routes';
import projectRoutes from '~/routes/project.routes';
import teamRoutes from '~/routes/team.routes';
import accountRoutes from '~/routes/account.routes';
import baseRoutes from '~/routes/base.routes';
import activityRoutes from '~/routes/activity.routes';

// middleware imports
import healthCheck from '~/middleware/healthCheck';
import notFound from '~/middleware/notFound';
import verifyToken from '~/middleware/verifyToken';
import cors from 'cors';
import helmet from 'helmet';
import logger, { stream } from '~/middleware/winston';
import cookieParser from 'cookie-parser';

//db connections
import { connectToRedis } from '~/database/redis_setup';
import { connectToNeo4j } from '~/database/neo4j_setup';
import { connectToMongo } from '~/database/mongo_setup';
import { connectToFirebase } from '~/database/firebase_setup';

import { TAuthUser } from '#/types/user';
dotenv.config();

const PORT = process.env.PORT ?? 3000;
const app = express();

declare module 'jsonwebtoken' {
    export interface UserJwtPayload extends jwt.JwtPayload {
        user: TAuthUser;
        xsrfToken: string;
    }
}

declare module 'express-serve-static-core' {
    export interface Request {
        user?: TAuthUser;
    }
}

export const registerCoreMiddleware = (): void => {
    try {
        // Middleware
        app.use(morgan('combined', { stream }));
        app.use(
            cors({
                origin: process.env.FRONTEND_URL,
                credentials: true,
            })
        );
        app.use(express.json());
        app.use(cookieParser());
        app.use(helmet());
        app.use(express.urlencoded({ extended: true }));

        app.use(healthCheck);
        app.use('/auth', authRoutes);
        app.use('/api', baseRoutes);

        app.use(verifyToken);
        app.use('/projects', projectRoutes);
        app.use('/teams', teamRoutes);
        app.use('/account', accountRoutes);
        app.use('/activity', activityRoutes);
        app.use(notFound);
    } catch (error) {
        logger.error('Error while registering core middlewares', error);
    }
};
const handleError = (): void => {
    process.on('uncaughtException', (err: Error) => {
        logger.error(
            `UNCAUGHT_EXCEPTION OCCURED : ${JSON.stringify(err.stack)}`
        );
    });
};

// start applicatoin
export const startApp = async (): Promise<void> => {
    try {
        // register core application level middleware
        await connectToMongo();
        await connectToRedis();
        await connectToNeo4j();
        connectToFirebase();

        registerCoreMiddleware();

        app.listen(PORT, () => {
            logger.info('Listening on 127.0.0.1:' + PORT);
        });

        // exit on uncaught exception
        handleError();
    } catch (err) {
        logger.error(
            `startup :: Error while booting the applicaiton ${JSON.stringify(
                err,
                undefined,
                2
            )}`
        );
        throw err;
    }
};
