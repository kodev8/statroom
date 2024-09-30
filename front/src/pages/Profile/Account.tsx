import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
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
import setTitle from '@/components/hooks/set-title';
import { useUserStore, TUserStore } from '@/stores/user.store';
import {
    emailSchema,
    TEmailSchema,
    TUpdateAccountSchema,
    updateAccountSchema,
    generateDefaultValuesFromSchema,
    TOtpSchema,
    otpSchema,
} from '#/types/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { AxiosError } from 'axios';
import { useToast } from '@/components/hooks/use-toast';
import { useState } from 'react';
import api from '@/constants/api';
import { TAuthUser } from '#/types/user';

export default function Account() {
    setTitle('Account');
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state: TUserStore) => state.setUser);

    const { toast } = useToast();

    // update ACCOUNT DETAILS
    const updateDetailsform = useForm<TUpdateAccountSchema>({
        resolver: zodResolver(updateAccountSchema),
        defaultValues: {
            fname: user?.fname,
            lname: user?.lname,
        },
    });

    const queryClient = useQueryClient();
    const updateDetailsMutation = useMutation({
        mutationFn: async (data: TUpdateAccountSchema) => {
            const response = await axiosInstance.patch('/account', data);
            return response.data;
        },
        onSuccess: (data: {
            message: string;
            fname: string;
            lname: string;
        }) => {
            console.log(data);
            // updateDetailsform.reset();
            setUser({ ...user as TAuthUser, ...data });
            queryClient.invalidateQueries({
                queryKey: ['user'],
            });
            toast({
                title: 'Account details updated',
                variant: 'success',
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

    const onUpdateDetailsSubmit = (data: TUpdateAccountSchema) => {
        updateDetailsMutation.mutate(data);
    };

    const {
        formState: {
            isDirty: updateDetailsIsDirty,
            isSubmitting: updateDetailsIsSubmitting,
            isValid: updateDetailsIsValid,
        },
    } = updateDetailsform;

    // request OTP for email update, send to new email
    const requestEmailUpdateForm = useForm<TEmailSchema>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: user?.email,
        },
    });

    const {
        formState: {
            isDirty: requestEmailUpdateIsDirty,
            isSubmitting: requestEmailUpdateIsSubmitting,
            isValid: requestEmailUpdateIsValid,
        },
    } = requestEmailUpdateForm;

    const requestEmailUpdateMutation = useMutation({
        mutationFn: async (data: TEmailSchema) => {
            const response = await axiosInstance.post(api.auth.sendOTP, data);
            return response.data;
        },
        onSuccess: (_data) => {
            setOtpDialogOpen(true);
            OTPform.setValue(
                'email',
                requestEmailUpdateForm.getValues('email')
            );
            toast({
                title: 'OTP sent to your new email',
                variant: 'success',
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

    const onRequestEmailUpdateSubmit = (data: TEmailSchema) => {
        requestEmailUpdateMutation.mutate(data);
    };

    // send post request to backend to verify OTP
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
            const response = await axiosInstance.patch(api.account.updateEmail, {
                ...data,
                email: requestEmailUpdateForm.getValues().email,
            });
            return response.data;

        },
        onSuccess: (data: {message: string, xsrfToken: string}) => {
            setOtpDialogOpen(false);
            toast({
                variant: 'success',
                title: 'Email verified',
                description:
                    'Your email has been successfully verified and updated',
            });
            localStorage.setItem('xsrfToken', data.xsrfToken);
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
        <div className="grid gap-6">
            <h3 className="text-lg font-semibold">
                Manage your account details
            </h3>
            <Card>
                <CardHeader>
                    <CardTitle className="font-bold text-xl">
                        Your Details
                    </CardTitle>
                    <CardDescription>
                        Your personal information displayed on your profile.
                    </CardDescription>
                </CardHeader>
                <Form {...updateDetailsform}>
                    <form
                        onSubmit={updateDetailsform.handleSubmit(
                            onUpdateDetailsSubmit
                        )}
                    >
                        <CardContent className="grid gap-4 py-4">
                            <FormField
                                control={updateDetailsform.control}
                                name="fname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={updateDetailsform.control}
                                name="lname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        {updateDetailsIsValid && (
                            <CardFooter className="flex border-t px-6 py-4">
                                <Button
                                    disabled={
                                        !updateDetailsIsDirty ||
                                        !updateDetailsIsValid ||
                                        updateDetailsIsSubmitting
                                    }
                                    isLoading={updateDetailsIsSubmitting}
                                    className="ml-auto"
                                >
                                    Save
                                </Button>
                            </CardFooter>
                        )}
                    </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-semibold text-lg">
                        Update Email
                    </CardTitle>
                    <CardDescription>
                        Updating your email will change your login email address
                        and will be used for all future communications. Hence it
                        requires verification.
                    </CardDescription>
                </CardHeader>
                <Form {...requestEmailUpdateForm}>
                    <form
                        className="grid gap-2 py-4"
                        onSubmit={requestEmailUpdateForm.handleSubmit(
                            onRequestEmailUpdateSubmit
                        )}
                    >
                        <CardContent>
                            <FormField
                                control={requestEmailUpdateForm.control}
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
                        </CardContent>

                        <CardFooter className="flex border-t px-6 py-4">
                            <Button
                                disabled={
                                    !requestEmailUpdateIsDirty ||
                                    !requestEmailUpdateIsValid ||
                                    requestEmailUpdateIsSubmitting
                                }
                                isLoading={requestEmailUpdateIsSubmitting}
                                className="ml-auto"
                            >
                                Verify
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
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
