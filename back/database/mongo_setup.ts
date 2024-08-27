import mongoose from 'mongoose';
import logger from '~/middleware/winston';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    logger.error('Mongo URI is not provided');
    process.exit(1);
}

const connectToMongo = async (): Promise<void> => {
    mongoose
        .connect(MONGO_URI)
        .then(() => logger.info('MongoDB connected successfully'))
        .catch((err) => {
            throw new Error(err);
        });
};

export { connectToMongo };
