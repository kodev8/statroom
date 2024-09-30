import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';

// import { NavLink } from "react-router-dom"
import {
    generateDefaultValuesFromSchema,
    TOtpSchema,
    otpSchema,
    emailSchema,
    TEmailSchema,
    TResetPasswordAnonSchema,
    resetPasswordAnonSchema,
} from '#/types/schemas';

import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import axiosInstance from '@/constants/axios';
import setTitle from '@/components/hooks/set-title';
import api from '@/constants/api';
import { AxiosError } from 'axios';
import { useToast } from '@/components/hooks/use-toast';
import { useState } from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '@/components/ui/passwordInput';

type formSteps = 'email' | 'otp' | 'resetPassword';
export default function ForgotPassword() {
    setTitle('Forgot Password');

    const [currentStep, setCurrentStep] = useState<formSteps>('email');
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm<TEmailSchema>({
        resolver: zodResolver(emailSchema),
        defaultValues: generateDefaultValuesFromSchema(emailSchema),
    });

    const {
        formState: { isSubmitting, isDirty, isValid },
    } = form;

    const otpForm = useForm<TOtpSchema>({
        resolver: zodResolver(otpSchema),
        defaultValues: generateDefaultValuesFromSchema(otpSchema),
    });

    const {
        formState: {
            isSubmitting: isOtpSubmitting,
            isDirty: isOtpDirty,
            isValid: isOtpValid,
        },
    } = otpForm;

    const passwordResetForm = useForm<TResetPasswordAnonSchema>({
        resolver: zodResolver(resetPasswordAnonSchema),
        defaultValues: generateDefaultValuesFromSchema(resetPasswordAnonSchema),
    });

    const {
        formState: {
            isSubmitting: isPasswordResetSubmitting,
            isDirty: isPasswordResetDirty,
            isValid: isPasswordResetValid,
        },
    } = passwordResetForm;

    const onSubmit = async (data: TEmailSchema) => {
        try {
            await axiosInstance.post(api.auth.sendOTP, data);
            setCurrentStep('otp');
            // console.log(otpForm.getValues())
            otpForm.setValue('email', data.email);
            passwordResetForm.setValue('email', data.email);
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof AxiosError
                        ? (error.response?.data.message ??
                          'Something went wrong')
                        : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const OTPonSubmit = async (data: TOtpSchema) => {
        try {
            await axiosInstance.post(api.auth.verifyOTP, data);
            setCurrentStep('resetPassword');
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof AxiosError
                        ? (error.response?.data.message ??
                          'Something went wrong')
                        : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const resetPasswordonSubmit = async (data: TResetPasswordAnonSchema) => {
        try {
            await axiosInstance.patch(api.auth.resetPasswordAnon, data);
            navigate('/login', {
                state: {
                    toast: {
                        variant: 'success',
                        title: 'Password Reset',
                        description: 'Your password has been reset',
                    },
                },
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.response?.data.message,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'An error occurred',
                });
            }
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Forgot Password</h1>

                    {currentStep == 'email' && (
                        <p className="text-sm text-muted-foreground">
                            Enter your email to receive a password reset link
                        </p>
                    )}

                    {currentStep == 'otp' && (
                        <p className="text-sm text-muted-foreground">
                            Enter the OTP sent to your email
                        </p>
                    )}

                    {currentStep == 'resetPassword' && (
                        <p className="text-sm text-muted-foreground">
                            Enter your new password
                        </p>
                    )}
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        {currentStep === 'email' && (
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
                                                    <Input
                                                        placeholder="me@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={
                                            !isDirty || !isValid || isSubmitting
                                        }
                                        className="w-full"
                                    >
                                        Send request
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {currentStep === 'otp' && (
                            <Form {...otpForm}>
                                <form
                                    onSubmit={otpForm.handleSubmit(OTPonSubmit)}
                                    className="w-2/3 space-y-6"
                                >
                                    <FormField
                                        control={otpForm.control}
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={
                                            !isOtpDirty ||
                                            !isOtpValid ||
                                            isOtpSubmitting
                                        }
                                    >
                                        Submit
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {currentStep === 'resetPassword' && (
                            <Form {...passwordResetForm}>
                                <form
                                    onSubmit={passwordResetForm.handleSubmit(
                                        resetPasswordonSubmit
                                    )}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={passwordResetForm.control}
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

                                    <FormField
                                        control={passwordResetForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordInput {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={
                                            !isPasswordResetDirty ||
                                            !isPasswordResetValid ||
                                            isPasswordResetSubmitting
                                        }
                                        className="w-full"
                                    >
                                        Send request
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
