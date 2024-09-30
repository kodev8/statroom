import { BellIcon, EyeNoneIcon, PersonIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useUserStore } from '@/stores/user.store';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useToast } from '@/components/hooks/use-toast';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    notificationsSchema,
    TNotificationSchema,
} from '#/types/schemas';

import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import api from '@/constants/api';
import { AxiosError } from 'axios';
import setTitle from '@/components/hooks/set-title';

function Notifications() {
    setTitle('Notifications');

    const user = useUserStore((state) => state.user);
    const { toast } = useToast();
    const form = useForm<TNotificationSchema>({
        resolver: zodResolver(notificationsSchema),
        defaultValues: {
            notifications: user?.notifications,
        },
    });

    const notificationMutation = useMutation({
        mutationFn: async (data: TNotificationSchema) => {
            const response = await axiosInstance.patch(
                api.account.updateNotificationSettings,
                data
            );
            return response.data;
        },
        onSuccess: (_data) => {
            // setUser(data); TODO: Fix this
            toast({
                title: 'Notification settings updated',
                description:
                    'You will now receive notifications as per your settings.',
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

    const onSubmit = (data: TNotificationSchema) => {
        notificationMutation.mutate(data);
    };

    return (
        <div className="grid gap-6">
            <h3 className="text-lg font-semibold">Manage your notifications</h3>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                        Choose what you want to be notified about.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="notifications"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>
                                            Notify me about...
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid w-full"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="all"
                                                            className="peer sr-only"
                                                        />
                                                    </FormControl>
                                                    <FormLabel
                                                        className="mx-2 flex items-start justify-center space-x-4 rounded-md p-2 transition-all 
                                                        hover:bg-accent hover:text-accent-foreground peer-checked:font-bold peer-aria-checked:border-primary peer-aria-checked:border"
                                                    >
                                                        <BellIcon className="mt-px h-5 w-5" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium leading-none">
                                                                Everything
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Email digest,
                                                                mentions & all
                                                                activity.
                                                            </p>
                                                        </div>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="important"
                                                            className="peer sr-only"
                                                        />
                                                    </FormControl>
                                                    <FormLabel
                                                        className="mx-2 flex items-start justify-center space-x-4 rounded-md p-2 transition-all 
                                                        hover:bg-accent hover:text-accent-foreground peer-checked:font-bold peer-aria-checked:border-primary peer-aria-checked:border"
                                                    >
                                                        <PersonIcon className="mt-px h-5 w-5" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium leading-none">
                                                                Available
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Only mentions
                                                                and comments.
                                                            </p>
                                                        </div>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="none"
                                                            className="peer sr-only"
                                                        />
                                                    </FormControl>
                                                    <FormLabel
                                                        className="mx-2 flex items-start justify-center space-x-4 rounded-md p-2 transition-all 
                                                        hover:bg-accent hover:text-accent-foreground peer-checked:font-bold peer-aria-checked:border-primary peer-aria-checked:border"
                                                    >
                                                        <EyeNoneIcon className="mt-px h-5 w-5" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium leading-none">
                                                                Ignoring
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Turn off all
                                                                notifications.
                                                            </p>
                                                        </div>
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default Notifications;


