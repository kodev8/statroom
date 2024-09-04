import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TAuthUser, TAuthType } from '#/types/user';
import { Response } from 'express';
import { Session } from 'neo4j-driver';
dotenv.config();

export const generateOTP = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};

export const cleanObj = (obj: any, defaultValue: any = ''): object => {
    Object.keys(obj).forEach((key) => {
        if (!obj[key]) {
            obj[key] = defaultValue ?? '';
        }
    });
    return obj;
};

type TSignedUser = {
    user?: Partial<TAuthUser>;
    xsrfToken: string;
};
export const createAccessToken = (toSign: TSignedUser): string => {
    return jwt.sign(toSign, process.env.JWT_SECRET_KEY as string, {
        expiresIn: '1d',
    });
};

export const createRefreshToken = (toSign: TSignedUser): string => {
    return jwt.sign(toSign, process.env.JWT_REFRESH_KEY as string, {
        expiresIn: '7d',
    });
};

type CookieOptions = {
    httpOnly: boolean;
    sameSite: 'strict';
    secure?: boolean;
    maxAge?: number;
};
export const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict',
    // secure: true,
} as CookieOptions;

export async function createOrFetchUser(
    user: Partial<TAuthUser>,
    authType: TAuthType,
    neo4jsession: Session
): Promise<{ user: Partial<TAuthUser>; isNewUser: boolean }> {
    const dbUser = await neo4jsession.run(
        `MATCH (u:User {email: $email}) RETURN u`,
        { email: user?.email }
    );
    const userExists = dbUser.records.length > 0;

    if (!userExists) {
        // throw a error if we try to log in but no user is found
        if (authType === 'login') {
            throw new Error('User not found');
        }

        // Register user
        const fieldString = Object.keys(user ?? {})
            .map((key) => `${key}: $${key}`)
            .join(', ')
            .trim();

        const query = `CREATE (u:User {${fieldString}}) RETURN u`;
        const record = await neo4jsession.run(query, user);
        const newUser = record.records[0].get('u').properties;

        return {
            user: {
                email: newUser.email,
                fname: newUser.fname,
                lname: newUser.lname,
                picture: newUser.picture,
                twoFactorEnabled: false,
            },
            isNewUser: true,
        };
    }

    return { user, isNewUser: false };
}

export async function setupAuthTokens(
    res: Response,
    user: Partial<TAuthUser>
): Promise<{ xsrfToken: string; token: string }> {
    const randomString = Math.random().toString(36).substring(7);
    const xsrfToken = createAccessToken({ xsrfToken: randomString });

    const token = createAccessToken({
        user,
        xsrfToken: randomString,
    });

    const refreshToken = createRefreshToken({
        user,
        xsrfToken: randomString,
    });

    const cookieOptions = {
        ...COOKIE_OPTIONS,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return { token, xsrfToken };
}

export type OAuthErrorResponse = {
    error: string;
    error_description?: string;
};

export type OAuthSuccessResponse = {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
};

// Discriminated union type for OAuth response
export type TOAuthResponse = OAuthErrorResponse | OAuthSuccessResponse;
