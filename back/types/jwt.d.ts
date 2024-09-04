import * as jwt from 'jsonwebtoken';
import { TAuthUser } from '#/types/user';

declare module 'jsonwebtoken' {
    export interface UserJwtPayload extends jwt.JwtPayload {
        user: TAuthUser;
        xsrfToken: string;
    }
}
