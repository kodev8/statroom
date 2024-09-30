import setTitle from '@/components/hooks/set-title';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NavLink } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useUserStore } from '@/stores/user.store';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/hooks/use-toast';
import axiosInstance from '@/constants/axios';
import api from '@/constants/api';
import { AxiosError } from 'axios';
import { TAuthUser } from '#/types/user';
function Security() {
    setTitle('Security');
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const { toast } = useToast();

    const enableTwoFactorMutation = useMutation({
        mutationFn: async () => {
            // sending what the user would like to do
            const response = await axiosInstance.patch(api.account.enable2fa, {
                twoFactorEnabled: !user?.twoFactorEnabled,
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast({
                title: 'Success',
                description: data.message,
                variant: 'success',
            });
            setUser({
                ...user,
                twoFactorEnabled: !user?.twoFactorEnabled,
            } as TAuthUser);
        },
        onError: (error: Error) => {
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
    return (
        <div className="grid gap-6">
            <h3 className="text-lg font-semibold">
                Manage your account security
            </h3>
            <Card>
                <CardHeader>
                    <CardTitle className="font-bold text-xl">
                        Authentication
                    </CardTitle>
                    <CardDescription>
                        Ensure your account is secure by connecting you
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex justify-between ">
                        <div>
                            <span className="font-semibold">
                                Update Password
                            </span>
                            <p className="text-sm text-slate-500">
                                Set a new password for your account
                            </p>
                        </div>
                        <Button variant={'outline'} asChild>
                            <NavLink to="/account/security/reset-password">
                                Get started
                            </NavLink>
                        </Button>
                    </div>
                    <Separator orientation="horizontal" className="w-full" />

                    <div className="flex justify-between ">
                        <div>
                            <span className="font-semibold">
                                Two factor Authentication
                            </span>
                            <p className="text-sm text-slate-500">
                                Enable two factor authentication to secure your
                                account with your email
                            </p>
                        </div>
                        <Switch
                            checked={user?.twoFactorEnabled}
                            onClick={() => enableTwoFactorMutation.mutate()}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Security;
