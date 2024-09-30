// import React from 'react'

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    // CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ReactLoading from 'react-loading';

// import { Label } from '@/components/ui/label';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '@/components/ui/select';
import { CheckCircle2Icon } from 'lucide-react';
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
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';

import { NavLink, useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '@/constants/axios';
import {
    registerSchema,
    TRegisterSchema,
    generateDefaultValuesFromSchema,
    TOtpSchema,
    otpSchema,
} from '#/types/schemas';
import SpacedText from '@/components/SpacedText';
import { GoogleLogin } from '@/components/oauth/Google';
import { GithubLogin } from '@/components/oauth/Github';
import setTitle from '@/components/hooks/set-title';
import api from '@/constants/api';

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { useState } from 'react';
import { useToast } from '@/components/hooks/use-toast';
import { AxiosError } from 'axios';
import { TToastLocationState } from '@/components/ToastWrapper';
import { PasswordInput } from '@/components/ui/passwordInput';
import { useMutation } from '@tanstack/react-query';

const Register = () => {
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [email, setEmail] = useState('');

    setTitle('Sign Up');
    const form = useForm<TRegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: generateDefaultValuesFromSchema(registerSchema),
    });

    const { toast } = useToast();

    const { formState } = form;

    const { isDirty, isSubmitting, isLoading } = formState;
    const registerMutation = useMutation({
        mutationFn: async (data: TRegisterSchema) => {
            await axiosInstance.post(api.auth.register, data);
        },
        onSuccess: () => {
            setEmail(form.getValues('email'));
            OTPform.setValue('email', form.getValues('email'));
            setIsOtpSent(true);
            form.reset();
            toast({
                variant: 'default',
                title: 'Success',
                description: 'One-time password sent to your email',
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

    const onSubmit = async (data: TRegisterSchema) => {
        registerMutation.mutate(data);
    };

    const OTPform = useForm<TOtpSchema>({
        resolver: zodResolver(otpSchema),
        defaultValues: generateDefaultValuesFromSchema(otpSchema),
    });

    const navigate = useNavigate();

    const otpMutation = useMutation({
        mutationFn: async (data: TOtpSchema) => {
            await axiosInstance.post(api.auth.verifyUser, { ...data, email });
        },
        onSuccess: () => {
            navigate('/dashboard', {
                state: {
                    toast: {
                        description: 'Account created successfully',
                        title: 'Success',
                        variant: 'success',
                    },
                } as TToastLocationState,
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
    const OTPonSubmit = async (data: TOtpSchema) => {
        otpMutation.mutate(data);
    };

    return (
        <div className="flex items-center justify-center flex-col">
            <Card className="mx-auto max-w-sm ">
                <CardHeader>
                    <CardTitle className="text-xl">Sign Up</CardTitle>
                    <CardDescription>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {
                        (isLoading || isSubmitting) && (
                            <div className="flex justify-center items-center">
                                <ReactLoading type="spin" color="#000" />
                            </div>
                        )
                    }
                    {!isOtpSent ? (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="grid gap-4 p-2"
                            >
                                <Carousel>
                                    <CarouselContent>
                                        <CarouselItem className="grid gap-4">
                                            <div className="grid grid-cols-2 gap-4 mx-1">
                                                <FormField
                                                    control={form.control}
                                                    name="fname"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                First name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="lname"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Last name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <CarouselNext
                                                text="Next"
                                                type="button"
                                                className="w-full"
                                            />
                                        </CarouselItem>
                                        <CarouselItem>
                                            <div className="grid gap-4 mx-1">
                                                <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Password
                                                            </FormLabel>
                                                            <FormControl>
                                                                <PasswordInput
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="confirmPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Password
                                                                Confirmation
                                                            </FormLabel>
                                                            <FormControl>
                                                                <PasswordInput
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {isSubmitting ? (
                                                    <Button
                                                        type="button"
                                                        className="w-full"
                                                        disabled
                                                    >
                                                        <ReactLoading
                                                            type={'spin'}
                                                            color={'#ffffff'}
                                                            height={20}
                                                            width={20}
                                                        />
                                                    </Button>
                                                ) : !isDirty ? (
                                                    <CarouselPrevious
                                                        text="Previous"
                                                        type="button"
                                                        disabled={false}
                                                    />
                                                ) : (
                                                    <Button
                                                        type="submit"
                                                        className="w-full"
                                                    >
                                                        Create an account
                                                    </Button>
                                                )}
                                            </div>
                                        </CarouselItem>
                                    </CarouselContent>
                                </Carousel>
                            </form>
                        </Form>
                    ) : (
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
                                            <FormLabel>
                                                One-Time Password
                                            </FormLabel>
                                            <FormControl>
                                                <InputOTP
                                                    maxLength={6}
                                                    {...field}
                                                >
                                                    <InputOTPGroup>
                                                        <InputOTPSlot
                                                            index={0}
                                                        />
                                                        <InputOTPSlot
                                                            index={1}
                                                        />
                                                        <InputOTPSlot
                                                            index={2}
                                                        />
                                                        <InputOTPSlot
                                                            index={3}
                                                        />
                                                        <InputOTPSlot
                                                            index={4}
                                                        />
                                                        <InputOTPSlot
                                                            index={5}
                                                        />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </FormControl>
                                            <FormDescription>
                                                Please enter the one-time
                                                password sent to your email.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    


                                    <Button 
                                    >Submit</Button>
                            </form>
                        </Form>
                    )}

                    <SpacedText text="or continue with" />
                    <div className="grid gap-2">
                        <GoogleLogin authType="signup" />
                        <GithubLogin authType="signup" />
                    </div>

                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <NavLink to="/login" className="underline">
                            Sign in
                        </NavLink>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-8 gap-4 flex flex-col lg:flex-row">
                <TickedCTA description="Create an account" />
                <TickedCTA description="Deploy your first project" />
                <TickedCTA description="Start your sport analysis" />
            </div>
        </div>
    );
};

export default Register;

//  call to actions on register page with ticked icon
const TickedCTA = ({ description }: { description: string }) => {
    return (
        <div className="flex items-center justify-start">
            <CheckCircle2Icon className=" w-6 h-6 mr-2" />
            <p className="text-sm  text-gray-800 dark:text-white">{description}</p>
        </div>
    );
};
