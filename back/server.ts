import dotenv from 'dotenv';
import logger from './middleware/winston';
dotenv.config();
import { startApp } from './boot/setup';

(async (): Promise<void> => {
    try {
        await startApp();
    } catch (error) {
        logger.error('Error in index.ts => startApp');
        logger.error(`Error; ${JSON.stringify(error, undefined, 2)}`);
    }
})();
