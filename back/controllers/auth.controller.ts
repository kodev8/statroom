import { Request, Response } from 'express';
import statusCodes from '~/constants/statusCodes';
import {
    emailSchema,
    loginSchema,
    otpSchema,
    registerSchema,
    resetPasswordAnonSchema,
    resetPasswordAuthSchema,
} from '#/types/schemas';
import logger from '~/middleware/winston';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getDriver } from '~/database/neo4j_setup';
import { redisClient } from '~/database/redis_setup';
import {
    generateOTP,
    cleanObj,
    createOrFetchUser,
    setupAuthTokens,
    TOAuthResponse,
} from '~/utils/auth.utils';
import {
    TAuthType,
    TGithubUser,
    OAuthProviders,
    TGoogleUser,
    // TOAuthUser,
} from '#/types/user';
import jwt from 'jsonwebtoken';
import tokenBlacklistModel from '~/models/tokenBlacklist.model';
import { parseZodBody } from '~/utils/zod.utils';
import {
    GOOGLE_AUTH_URL,
    GITHUB_AUTH_URL,
    GITHUB_FETCH_USER_URL,
} from '~/constants/auth';
import sendMail from '~/mail/sendMail';
dotenv.config();

export const login = async (req: Request, res: Response): Promise<Response> => {
    const result = parseZodBody(loginSchema, req, res);

    if (!result.success) {
        return result.response;
    }
    const { email, password } = result.data;
    // find user and check password
    const neo4jsession = getDriver()?.session();
    const query = `MATCH (u:User {email: $email}) RETURN u`;
    const userRecord = await neo4jsession.run(query, { email });
    if (userRecord.records.length === 0) {
        return res
            .status(statusCodes.notFound)
            .json({ error: 'Bad credentials' });
    }

    const userFound = userRecord.records[0];
    const userProps = userFound.get('u').properties;
    const hashedPassword = userProps.password;

    // user who is authenticated with oauth will not have a password
    if (!hashedPassword) {
        return res
            .status(statusCodes.badRequest)
            .json({ message: 'Bad Credentitals' });
    }
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
        return res
            .status(statusCodes.unauthorized)
            .json({ error: 'Invalid password' });
    }

    const toSign = {
        fname: userProps.fname,
        lname: userProps.lname,
        email: userProps.email,
        picture: userProps.picture,
        twoFactorEnabled: userProps.twoFactorEnabled,
        isAdmin: userProps.isAdmin,
    };

    if (!userProps.twoFactorEnabled) {
        const { xsrfToken } = await setupAuthTokens(res, toSign);

        return res.status(statusCodes.success).json({
            xsrfToken,
            message: 'Logged in successfully',
            user: toSign,
        });
    } else {
        return res
            .status(statusCodes.success)
            .json({ message: 'moving to 2fa', twofa: true });
    }
};

export const register = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(registerSchema, req, res);

        if (!result.success) {
            return result.response;
        }

        const neo4jsession = getDriver()?.session();

        // check if user exists
        const query = `MATCH (u:User {email: $email}) RETURN u`;
        const existingUser = await neo4jsession.run(query, {
            email: result.data.email,
        });
        if (existingUser.records.length > 0) {
            return res
                .status(statusCodes.badRequest)
                .json({ error: 'User already exists' });
        }

        // create new user in redis, wait till email is verified to put it in neo4j
        const user = { ...result.data, verified: false, otp: generateOTP() };

        await redisClient.set(
            `user-to-verify:${result.data.email}`,
            JSON.stringify(user)
        );
        redisClient.expire(`user-to-verify:${result.data.email}`, 60 * 10); // expire shortly after otp expires

        const attachments = [
            {
                filename: 'statroom-logo.png',
                path: './mail/templates/images/statroom-logo.png',
                cid: 'statroom-logo',
            },
        ];
        // send email
        await sendMail(
            result.data.email,
            'OTP',
            { otp: user.otp },
            'verify',
            attachments
        );

        return res
            .status(statusCodes.success)
            .json({ message: 'Verification email sent' });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'could not send request' });
    }
};

export const refreshToken = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
        return res.status(statusCodes.badRequest).json({
            message: 'Refresh token required',
        });
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_KEY as string
    ) as jwt.UserJwtPayload;

    const { user } = decoded;
    if (!user) {
        return res
            .status(statusCodes.badRequest)
            .json({ message: 'Invalid token' });
    }

    const neo4jsession = getDriver()?.session();
    const query = `MATCH (u:User {email: $email}) RETURN u`;
    const dbUser = await neo4jsession?.run(query, { email: user.email });
    if (dbUser.records.length === 0) {
        return res
            .status(statusCodes.notFound)
            .json({ message: 'User not found' });
    }
    const authUser = dbUser.records[0].get('u').properties;
    const toSign = {
        fname: authUser.fname,
        lname: authUser.lname,
        email: authUser.email,
        picture: authUser.picture,
        twoFactorEnabled: authUser.twoFactorEnabled,
        isAdmin: authUser.isAdmin,
    };
    const { token, xsrfToken } = await setupAuthTokens(res, toSign);
    return res
        .status(statusCodes.success)
        .json({ message: 'Token refreshed', token, xsrfToken });
};

export const sendOTP = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(emailSchema, req, res);

        if (!result.success) {
            return result.response;
        }
        const is2fa = req.path.includes('2fa');
        const { email } = result.data;

        // check if user exists for 2FA ONLY
        if (is2fa) {
            const neo4jsession = getDriver()?.session();
            const query = `MATCH (u:User {email: $email}) RETURN u`;
            const user = await neo4jsession.run(query, { email });
            if (user.records.length === 0) {
                return res
                    .status(statusCodes.notFound)
                    .json({ message: 'User not found' });
            }
        }

        const otp = generateOTP();

        // store otp in redis
        const resp = await redisClient.set(`otp:${email}`, otp);
        await redisClient.expire(`otp:${email}`, 60 * 10); // expire otp  10 minutes
        if (resp !== 'OK') {
            throw new Error('Error while setting OTP in redis');
        }
        // }

        // send mail here
        await sendMail(email, 'OTP', { otp }, 'verify');

        // otp message sent even if user does not exist to prevent enumeration
        return res.status(statusCodes.success).json({ message: 'OTP sent' });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'Error while sending OTP' });
    }
};

export const verifyUser = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(otpSchema, req, res);
        if (!result.success) {
            return result.response;
        }

        const { email, otp } = result.data;

        const user = await redisClient.get(`user-to-verify:${email}`);
        if (!user) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'User not found' });
        }

        const userObj = JSON.parse(user);
        if (userObj.otp === parseInt(otp)) {
            await redisClient.del(`user-to-verify:${email}`);
            // add user to neo4j
            const neo4jsession = getDriver()?.session();
            const hashedPassword = await bcrypt.hash(userObj.password, 10);
            const {
                confirmPassword: _confirmPassword,
                otp: _otp,
                ...finalUser
            } = userObj;
            finalUser.verified = true;
            finalUser.twoFactorEnabled = true;

            const fieldString = Object.keys(finalUser)
                .map((key) => `${key}: $${key}`)
                .join(', ');
            const query = `CREATE (u:User {${fieldString}}) RETURN u`;

            finalUser.password = hashedPassword;

            const userRecord = await neo4jsession.run(query, finalUser);

            const userFound = userRecord.records[0].get('u').properties;
            const toSign = {
                fname: userFound.fname,
                lname: userFound.lname,
                email: userFound.email,
                picture: userFound.picture,
                twoFactorEnabled: userFound.twoFactorEnabled,
                isAdmin: userFound.isAdmin,
            };

            const { xsrfToken } = await setupAuthTokens(res, toSign);

            return res
                .status(statusCodes.success)
                .json({ message: 'User verified', xsrfToken, user: toSign });
        }
        return res
            .status(statusCodes.badRequest)
            .json({ message: 'Incorrect OTP' });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'Error while verifying user' });
    }
};

export const verifyOTP = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(otpSchema, req, res);

        if (!result.success) {
            return result.response;
        }

        const { email, otp } = result.data;
        const { type } = req.body;
        const otpInRedis = await redisClient.get(`otp:${email}`);

        if (otpInRedis === otp) {
            await redisClient.del(`otp:${email}`);

            if (type === 'login') {
                //login from two factor
                const neo4jsession = getDriver()?.session();
                const query = `MATCH (u:User {email: $email}) RETURN u`;
                const user = await neo4jsession.run(query, { email });
                if (user.records.length === 0) {
                    return res
                        .status(statusCodes.notFound)
                        .json({ message: 'User not found' });
                }
                const userFound = user.records[0];
                const userProps = userFound.get('u').properties;
                const toSign = {
                    fname: userProps.fname,
                    lname: userProps.lname,
                    email: userProps.email,
                    picture: userProps.picture,
                    twoFactorEnabled: userProps.twoFactorEnabled,
                    isAdmin: userProps.isAdmin,
                };

                const { xsrfToken } = await setupAuthTokens(res, toSign);

                return res.status(statusCodes.success).json({
                    xsrfToken,
                    message: 'Logged in successfully',
                    user: toSign,
                });
            }
            return res
                .status(statusCodes.success)
                .json({ message: 'OTP verified' });
        }

        return res
            .status(statusCodes.notFound)
            .json({ message: 'Incorrect OTP' });
    } catch (error) {
        logger.error(error);

        return res
            .status(statusCodes.serverError)
            .json({ message: 'Error while verifying OTP' });
    }
};

export const logout = async (
    req: Request,
    res: Response
): Promise<Response> => {
    // logout user and add token to blacklist

    try {
        const token = req.cookies['token']; // must have token, checked in verifyToken middleware
        const refreshToken = req.cookies['refreshToken'];
        res.clearCookie('token');
        res.clearCookie('refreshToken');

        const blacklistedToken = new tokenBlacklistModel({ token });
        await blacklistedToken.save();

        if (refreshToken) {
            blacklistedToken.token = refreshToken;
        }
        await blacklistedToken.save();
        return res
            .status(statusCodes.success)
            .json({ message: 'Logout route' });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'Could not logout' });
    }
};

export const resetPassword = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const result = parseZodBody(resetPasswordAuthSchema, req, res);

    if (!result.success) {
        return result.response;
    }

    const { oldPassword, password, confirmPassword } = result.data;
    if (password !== confirmPassword) {
        return res
            .status(statusCodes.badRequest)
            .json({ message: 'Passwords do not match' });
    }

    if (oldPassword === password) {
        return res.status(statusCodes.badRequest).json({
            message: 'New password cannot be the same as old password',
        });
    }

    // get user password
    const neo4jsession = getDriver()?.session();
    const query = `MATCH (u:User {email: $email}) RETURN u`;
    const user = await neo4jsession.run(query, { email: req.user?.email });
    if (user.records.length === 0) {
        return res
            .status(statusCodes.notFound)
            .json({ error: 'User not found' });
    }

    const userRecord = user.records[0];
    const userProps = userRecord.get('u').properties;
    const hashedPassword = userProps.password;
    const passwordMatch = await bcrypt.compare(oldPassword, hashedPassword);
    if (!passwordMatch) {
        return res
            .status(statusCodes.unauthorized)
            .json({ message: 'Invalid password' });
    }

    // update password
    const hashedNewPassword = await bcrypt.hash(password, 10);
    const updateQuery = `MATCH (u:User {email: $email}) SET u.password = $password RETURN u`;
    await neo4jsession.run(updateQuery, {
        email: req.user?.email,
        password: hashedNewPassword,
    });

    return res
        .status(statusCodes.success)
        .json({ message: 'Password updated' });
};

export const resetPasswordAnon = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const result = parseZodBody(resetPasswordAnonSchema, req, res);

    if (!result.success) {
        return result.response;
    }
    const { email, password, confirmPassword } = result.data;
    if (password !== confirmPassword) {
        return res
            .status(statusCodes.badRequest)
            .json({ error: 'Passwords do not match' });
    }

    // find user and update password
    const neo4jsession = getDriver()?.session();
    const query = `MATCH (u:User {email: $email}) RETURN u`;
    const user = await neo4jsession.run(query, { email });
    if (user.records.length === 0) {
        return res
            .status(statusCodes.notFound)
            .json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // update password
    const updateQuery = `MATCH (u:User {email: $email}) SET u.password = $password RETURN u`;
    await neo4jsession.run(updateQuery, { email, password: hashedPassword });

    return res
        .status(statusCodes.success)
        .json({ message: 'Reset password route' });
};

export const handleOAuthProvider = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { provider } = req.params;
    const { authType } = req.body;

    if (!authType) {
        return res
            .status(statusCodes.badRequest)
            .json({ error: 'Auth type is required' });
    }

    try {
        switch (provider) {
            case OAuthProviders.google:
                return handleGoogleAuth(req, res, authType);
            case OAuthProviders.github:
                return await handleGithubAuth(req, res, authType);
            default:
                return res
                    .status(statusCodes.badRequest)
                    .json({ error: 'Invalid provider' });
        }
    } catch (error) {
        logger.error(error);
        if (error instanceof Error) {
            return res
                .status(statusCodes.badRequest)
                .json({ error: error.message });
        }
        return res
            .status(statusCodes.serverError)
            .json({ error: 'Could not handle provider' });
    }
};

const handleGoogleAuth = async (
    req: Request,
    res: Response,
    authType: TAuthType
): Promise<Response> => {
    const userResponse = await fetch(GOOGLE_AUTH_URL, {
        headers: {
            Authorization: `Bearer ${req.body.access_token}`,
            Accept: 'application/json',
        },
    });
    if (!userResponse.ok) throw new Error('Could not fetch user');

    const {
        id,
        email,
        name,
        given_name: fname,
        family_name: lname,
        picture,
    } = (await userResponse.json()) as TGoogleUser;

    const user = {
        id,
        email,
        name,
        fname,
        lname,
        picture,
    };

    const userCleaned = cleanObj(user);
    const neo4jsession = getDriver()?.session();
    const { user: dbUser, isNewUser } = await createOrFetchUser(
        userCleaned,
        authType,
        neo4jsession
    );
    const { xsrfToken } = await setupAuthTokens(res, dbUser);

    return res.status(statusCodes.success).json({
        message: isNewUser ? 'User created' : 'Logged in successfully',
        xsrfToken,
        user: dbUser,
    });
};

const handleGithubAuth = async (
    req: Request,
    res: Response,
    authType: TAuthType
): Promise<Response> => {
    const { code } = req.body;
    if (!code) {
        return res
            .status(statusCodes.badRequest)
            .json({ error: 'Code is required' });
    }

    const url = new URL(GITHUB_AUTH_URL);
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID ?? '',
        client_secret: process.env.GITHUB_CLIENT_SECRET ?? '',
        code,
    });
    url.search = params.toString();

    const oauthResponse = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });

    const response = (await oauthResponse.json()) as TOAuthResponse;
    if ('error' in response) {
        return res
            .status(statusCodes.badRequest)
            .json({ error: response.error });
    }

    const userResponse = await fetch(GITHUB_FETCH_USER_URL, {
        headers: {
            Authorization: `token ${response.access_token}`,
            Accept: 'application/json',
        },
    });

    if (!userResponse.ok) throw new Error('Could not fetch user');

    const {
        id,
        login: username,
        email,
        name,
        avatar_url: picture,
    } = (await userResponse.json()) as TGithubUser;

    const resolveName = name?.split(' ') ?? ['', ''];
    const user = {
        id,
        username,
        email,
        fname: resolveName[0],
        lname: resolveName[1],
        picture,
    };

    if (!email) {
        const emailResponse = await fetch(
            `https://api.github.com/user/emails`,
            {
                headers: {
                    Authorization: `token ${response.access_token}`,
                    Accept: 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            }
        );
        if (!emailResponse.ok) throw new Error('Could not fetch user emails');
        const emails = await emailResponse.json();
        const primaryEmail = (emails as any).find(
            (email: any) => email.primary
        )?.email;
        user.email = primaryEmail;
    }

    const neo4jsession = getDriver()?.session();

    const userCleaned = cleanObj(user);
    const { user: dbUser, isNewUser } = await createOrFetchUser(
        userCleaned,
        authType,
        neo4jsession
    );
    const { xsrfToken } = await setupAuthTokens(res, dbUser);

    return res.status(statusCodes.success).json({
        message: isNewUser ? 'User created' : 'Logged in successfully',
        xsrfToken,
        user: dbUser,
    });
};

export const me = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res
            .status(statusCodes.success)
            .json({ message: 'Token verified', user: req.user });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'Error while verifying token' });
    }
};
