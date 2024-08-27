import neo4j, { Driver } from 'neo4j-driver';
import logger from '~/middleware/winston';
import dotenv from 'dotenv';
dotenv.config();

let driver: Driver;
let hasFailed = false;
let initLog = false;
async function connectToNeo4j(): Promise<void> {
    driver = neo4j.driver(
        process.env.NEO4J_URI as string,
        neo4j.auth.basic(
            process.env.NEO4J_USER as string,
            process.env.NEO4J_PASSWORD as string
        ),
        {
            disableLosslessIntegers: true,
        }
    );

    // Periodic check to keep the connection alive
    setInterval(async () => {
        try {
            // prevent polluting logs with connection checks
            await driver.getServerInfo();
            if (!initLog) {
                logger.info('Neo4j connected successfully');
                initLog = true;
            }
            if (hasFailed) {
                logger.info('Neo4j connection restored');
                hasFailed = false;
            }
        } catch (error) {
            logger.error('Connection check failed:', error);
            connectToNeo4j();
            hasFailed = true;
        }
    }, 30000);
}

const getDriver = (): Driver => {
    if (!driver) {
        throw new Error('Driver not initialized');
    }
    return driver;
};

export { connectToNeo4j, getDriver };
