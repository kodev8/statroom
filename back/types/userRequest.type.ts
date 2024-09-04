import { TAuthUser } from '#/types/user';

declare module 'express-serve-static-core' {
    export interface Request {
        user?: TAuthUser;
    }
}
