// import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    generateDefaultValuesFromSchema,
    loginSchema,
    TLoginSchema,
    otpSchema,
    TOtpSchema,
} from '#/types/schemas';

import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { GithubLogin } from '@/components/oauth/Github';
import { GoogleLogin } from '@/components/oauth/Google';
import axiosInstance from '@/constants/axios';
import { useToast } from '@/components/hooks/use-toast';
import SpacedText from '@/components/SpacedText';
import setTitle from '@/components/hooks/set-title';
import { AxiosError } from 'axios';
import { PasswordInput } from '@/components/ui/passwordInput';
import baseRoutes from '@/constants/routes';
import api from '@/constants/api';
import { useUserStore } from '@/stores/user.store';
import { TAuthUser } from '#/types/user';
import { TToastLocationState } from '@/components/ToastWrapper';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    // CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export interface LoginState {
    from: string;
}

export default function Login() {
    setTitle('Login');
    const location = useLocation();
    const { toast } = useToast();
    const { from } = (location.state as LoginState) ?? {};
    const setUser = useUserStore((state) => state.setUser);
    const setAuthenticated = useUserStore((state) => state.setAuthenticated);

    const navigate = useNavigate();
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);

    const form = useForm<TLoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: generateDefaultValuesFromSchema(loginSchema),
    });

    const {
        formState: { isSubmitting, isDirty, isValid },
    } = form;

    const mutation = useMutation({
        retry: 1,
        mutationFn: async (data: TLoginSchema) => {
            const response = await axiosInstance.post(api.auth.login, data);
            return response.data;
        },
        onSuccess: (data: {
            user: TAuthUser;
            xsrfToken: string;
            twofa: boolean;
        }) => {
            if (data.twofa) {
                // setUser(data.user);
                OTPform.setValue('email', form.getValues('email'));
                handleTwoFactoLoginMutation.mutate();
            } else {
                const user = data.user;
                setUser({ ...user, isAuthenticated: true });
                localStorage.setItem('xsrfToken', data.xsrfToken);
                navigate(from ?? baseRoutes.dashboard, {
                    state: {
                        toast: {
                            title: 'Login Successful',
                            description: 'Welcome back!',
                            variant: 'success',
                        },
                    } as TToastLocationState,
                });
            }
        },
        onError: (error) => {
            toast({
                title: 'Login Error',
                description:
                    error instanceof AxiosError
                        ? (error.response?.data.message ??
                          'Something went wrong')
                        : 'Something went wrong',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = async (data: TLoginSchema) => {
        mutation.mutate(data);
    };

    const handleTwoFactoLoginMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post(api.auth.sendOTP2FA, {
                email: form.getValues('email'),
            });
            return response.data;
        },
        onSuccess: () => {
            setOtpDialogOpen(true);
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

    const OTPform = useForm<TOtpSchema>({
        resolver: zodResolver(otpSchema),
        defaultValues: generateDefaultValuesFromSchema(otpSchema),
    });

    const {
        formState: {
            isDirty: OTPisDirty,
            isSubmitting: OTPisSubmitting,
            isValid: OTPisValid,
        },
    } = OTPform;

    const otpMutation = useMutation({
        mutationFn: async (data: TOtpSchema) => {
            const response = await axiosInstance.post(api.auth.verifyOTP, {
                ...data,
                email: form.getValues('email'),
                type: 'login',
            });
            return response.data;
        },
        onSuccess: (data: { user: TAuthUser; xsrfToken: string }) => {
            console.log('OTP SUCCESS', data);
            setOtpDialogOpen(false);
            setAuthenticated(true);
            setUser(data.user);
            localStorage.setItem('xsrfToken', data.xsrfToken);

            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
                variant: 'success',
            });
            navigate(from ?? baseRoutes.dashboard);
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
    const OTPonSubmit = async (data: TOtpSchema) => {
        otpMutation.mutate(data);
    };

    return (
        <div className="flex items-center justify-center">
            <Card className="mx-auto grid w-fit *:md:w-[400px]">
                <CardHeader className="grid">
                    <CardTitle className="text-xl font-bold">Login</CardTitle>
                    <CardDescription>
                        Login to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <PasswordInput {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <NavLink
                                        to="/forgot-password"
                                        className="ml-auto inline-block text-sm underline"
                                    >
                                        Forgot your password?
                                    </NavLink>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    isLoading={
                                        isSubmitting || mutation.isPending
                                    }
                                    disabled={
                                        !isDirty || !isValid || isSubmitting
                                    }
                                >
                                    Login
                                </Button>
                            </form>
                        </Form>

                        <SpacedText text="or continue with" />
                        <GoogleLogin authType="login" />
                        <GithubLogin authType="login" />
                    </div>
                </CardContent>
                <CardFooter className="text-center">
                    <div className="mt-4 text-center text-sm">
                        Don't have an account?{' '}
                        <NavLink to="/register" className="underline">
                            Sign up
                        </NavLink>
                    </div>
                </CardFooter>
            </Card>

            <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Email Verification</DialogTitle>
                    </DialogHeader>
                    <Form {...OTPform}>
                        <form
                            onSubmit={OTPform.handleSubmit(OTPonSubmit)}
                            className="w-2/3 space-y-6"
                        >
                            <FormField
                                control={OTPform.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>One-Time Password</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormDescription>
                                            Please enter the one-time password
                                            sent to your email.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={
                                        !OTPisDirty ||
                                        !OTPisValid ||
                                        OTPisSubmitting
                                    }
                                    isLoading={OTPisSubmitting}
                                >
                                    Submit
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
