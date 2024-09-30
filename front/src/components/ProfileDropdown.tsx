import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button, ButtonProps } from '@/components/ui/button';

import { NavLink, useNavigate } from 'react-router-dom';

import { CircleUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import axiosInstance from '@/constants/axios';
import { TToastLocationState } from './ToastWrapper';
import { toast } from '@/components/hooks/use-toast';
import { useUserStore, TUserStore } from '@/stores/user.store';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function ProfileDropdown({ className, ...props }: Readonly<ButtonProps>) {
    const navigate = useNavigate();
    const setAuthenticated = useUserStore(
        (state: TUserStore) => state.setAuthenticated
    );
    const setUser = useUserStore((state: TUserStore) => state.setUser);

    const queryClient = useQueryClient();
    const logoutMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post('/auth/logout');
            return response.data;
        },
        onSuccess: () => {
            setAuthenticated(false);
            localStorage.removeItem('xsrfToken');
            queryClient.invalidateQueries({
                queryKey: ['user'],
            });
            navigate('/login', {
                state: {
                    toast: {
                        title: 'Logout',
                        description: 'You have been logged out',
                        variant: 'default',
                    },
                } as TToastLocationState,
            });
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    setAuthenticated(false);
                    localStorage.removeItem('xsrfToken');
                    queryClient.invalidateQueries({
                        queryKey: ['user'],
                    });
                    setUser(null);
                    navigate('/login', {
                        state: {
                            toast: {
                                title: 'Unauthorized',
                                description:
                                    'You need to login to access this page',
                                variant: 'default',
                            },
                        } as TToastLocationState,
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Logout Error',
                        description:
                            error.response?.data.message || 'An error occurred',
                    });
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Logout Error',
                    description: 'An error occurred',
                });
            }
        },
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    {...props}
                    variant="outline"
                    size="icon"
                    className={cn('overflow-hidden rounded-full', className)}
                >
                    {/* <img
                                    src="/placeholder-user.jpg"
                                    width={36}
                                    height={36}
                                    alt="Avatar"
                                    className="overflow-hidden rounded-full"
                  /> */}
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <NavLink to="/account">Account</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ProfileDropdown;
