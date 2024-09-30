import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import axiosInstance from '@/constants/axios';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '../Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/hooks/use-toast';
import { AxiosError } from 'axios';
import { useUserStore, TUserStore } from '@/stores/user.store';
import { useMutation } from '@tanstack/react-query';
import { TAuthType, TAuthUser } from '#/types/user';
import api from '@/constants/api';
import baseRoutes from '@/constants/routes';
import { LoginState } from '@/pages/Auth/Login';

type TGoogleLoginProps = {
    authType: TAuthType;
};
export const GoogleLogin = ({ authType }: TGoogleLoginProps) => {
    const { toast } = useToast();
    const setUser = useUserStore((state: TUserStore) => state.setUser);
    const buttonText = authType === 'signup' ? 'Sign Up' : 'Login';
    const location = useLocation();
    const navigate = useNavigate();
    const { from } = (location.state as LoginState) ?? {};

    const mutation = useMutation({
        mutationFn: async (data: TokenResponse) => {
            const response = await axiosInstance.post(api.auth.google, {
                ...data,
                authType,
            });
            return response.data;
        },

        // return auth user data
        onSuccess: (data: { user: TAuthUser; xsrfToken: string }) => {
            const user = data.user;
            localStorage.setItem('xsrfToken', data.xsrfToken);
            setUser({ ...user, isAuthenticated: true });
            navigate(from ?? baseRoutes.dashboard, {
                state: {
                    toast: {
                        title: `${buttonText} Successful`,
                        message: `Welcome${authType === 'signup' ? '' : ' back'}!`,
                        variant: 'success',
                    },
                },
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description:
                    error instanceof AxiosError
                        ? (error.response?.data.message ??
                          'Something went wrong')
                        : 'Something went wrong',
                variant: 'destructive',
            });
        },
    });

    const googleLoginHandler = useGoogleLogin({
        onSuccess: (codeResponse) => mutation.mutate(codeResponse),
        onError: (_error) => {
            toast({
                variant: 'destructive',
                title: 'Login Error',
                description: 'Error logging in with Google',
            });
        },
    });

    return (
        <Button
            variant="outline"
            className="w-full"
            onClick={() => googleLoginHandler()}
        >
            <GoogleIcon height={20} width={20} className="mr-2" />
            {buttonText} with Google
        </Button>
    );
};
