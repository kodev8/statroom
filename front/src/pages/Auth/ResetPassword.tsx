import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';

// import { NavLink } from "react-router-dom"
import {
    generateDefaultValuesFromSchema,
    resetPasswordAuthSchema,
    TResetPasswordAuthSchema,
} from '#/types/schemas';

import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import axiosInstance from '@/constants/axios';
import api from '@/constants/api';
import { AxiosError } from 'axios';
import { useToast } from '@/components/hooks/use-toast';
import { PasswordInput } from '@/components/ui/passwordInput';

// TODO: reset password anon vs auhtenticated
export default function ResetPassword() {
    const form = useForm<TResetPasswordAuthSchema>({
        resolver: zodResolver(resetPasswordAuthSchema),
        defaultValues: generateDefaultValuesFromSchema(resetPasswordAuthSchema),
    });
    const { toast } = useToast();

    const {
        formState: { isSubmitting, isDirty },
    } = form;

    const onSubmit = async (data: TResetPasswordAuthSchema) => {
        try {
            await axiosInstance.patch(api.auth.resetPassword, data);

            form.reset();

            toast({
                title: 'Password updated',
                description: 'Your password has been updated',
                variant: 'success',
            });
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

    return (
        <div className="flex items-center justify-center">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Reset Password</h1>
                </div>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="oldPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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

                                <FormField
                                    control={form.control}
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
                                    disabled={!isDirty}
                                    isLoading={isSubmitting}
                                    className="w-full"
                                >
                                    Update
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
