import admin, { ServiceAccount } from 'firebase-admin';
import config from '~/firebase-conf';
import logger from '~/middleware/winston';
import { Bucket } from '@google-cloud/storage';

export const connectToFirebase = (): void => {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(config as ServiceAccount),
            storageBucket: 'gs://grak-twitter-166d0.appspot.com',
        });
        logger.info('Firebase connected successfully');
    } catch (err) {
        logger.error(`Connection error\n${err}}`);
        process.exit(1);
    }
};

export const getBucket = (): Bucket => {
    return admin.storage().bucket();
};
