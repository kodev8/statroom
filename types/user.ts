import { TNotificationSchema, TUserProjectRolesSchema } from "./schemas";

export type TAuthType = 'signup' | 'login';

export type TGoogleUser = {
    id: string,
    email: string,
    verified_email?: boolean,
    name: string,
    given_name?: string,
    family_name?: string,
    picture?: string,
}

export type TGithubUser = {
    id: number,
    login?: string,
    node_id?: string,
    email: string,
    name?: string,
    avatar_url?: string,
}

type TBaseUser = {
    fname: string,
    lname: string,
    email: string,
    picture?: string,
}

export type TUser = TBaseUser & {
    isAuthenticated?: boolean,
    password?: string,
    token?: string,
    refeshToken?: string,
    twoFactorEnabled?: boolean,
}

export type TMember = TBaseUser & TUserProjectRolesSchema & {
    status: 'active' | 'pending' | 'blocked',
    joinedAt: string,
    lastActiveAt: string,
}

export enum OAuthProviders {
    google = 'google',
    github = 'github',
}

export type TOAuthUser = TGoogleUser | TGithubUser | null;
export type TAuthUser = TUser & TOAuthUser & Partial<TNotificationSchema> & {
    isAdmin?: boolean,
};