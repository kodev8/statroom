// import {
//     createContext,
//     useEffect,
//     useState,
//     useContext,
//     ReactNode,
// } from 'react';
// import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import axiosInstance from '@/constants/axios';
import { Button } from '@/components/ui/button';
// import { GoogleIcon } from '../Icons';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '@/hooks/use-toast';
// import { AxiosError } from 'axios';
// import ReactLoading from 'react-loading';
import { useGithubStore } from '@/stores/oauth.store';
import { TToastLocationState } from '@/components/ToastWrapper';
import { Navigate } from 'react-router-dom';
import { TAuthType } from '#/types/user';
import { useUserStore } from '@/stores/user.store';

type TGithubLoginProps = {
    authType: TAuthType;
};

export const GithubLogin = ({ authType }: TGithubLoginProps) => {
    const setAuthType = useGithubStore((state) => state.setAuthType);

    const forwardToGithubLogin = () => {
        setAuthType(authType);
        window.location.assign(
            'https://github.com/login/oauth/authorize?client_id=' +
                import.meta.env['VITE_GITHUB_CLIENT_ID'] +
                '&scope=read:user,user:email'
        );
    };

    const buttonText = authType === 'signup' ? 'Sign Up' : 'Login';

    return (
        <Button
            variant="outline"
            className="w-full"
            onClick={() => forwardToGithubLogin()}
        >
            <GitHubLogoIcon height={20} width={20} className="mr-2" />
            {buttonText} with Github
        </Button>
    );
};

export const GithubRedirectLoader = async () => {
    const authType = useGithubStore.getState().authType;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // error should get caught by loader and pushed to github redirect
        const response = await axiosInstance.post('/auth/oauth/github', {
            code,
            authType,
        });
        const setUser = useUserStore.getState().setUser;
        setUser({ ...response.data.user, isAuthenticated: true });
        localStorage.setItem('xsrfToken', response.data.xsrfToken);

        return response.data;
    }
};

export const GithubRedirect = ({ fail }: { fail?: boolean }) => {
    const authType = useGithubStore((state) => state.authType);
    const redirectTo = authType === 'login' ? '/login' : '/register';
    if (fail) {
        return (
            <Navigate
                to={redirectTo}
                state={
                    {
                        toast: {
                            title: 'Login Error',
                            description: 'Error logging in with Github',
                            variant: 'destructive',
                        },
                    } as TToastLocationState
                }
            />
        );
    }

    return (
        <Navigate
            to="/dashboard"
            state={{
                toast: {
                    title: 'Login Successful',
                    message: `Welcome${authType === 'signup' ? '' : ' back'}!`,
                    variant: 'success',
                },
            }}
        />
    );
};
