import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { useToast } from '@/components/hooks/use-toast';
import { AxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { TActivity } from '#/types/activity';


type TActivityCardProps = {
    item: TActivity,
};
export function ActivityCard({ item }: Readonly<TActivityCardProps>) {
    const queryClient = useQueryClient();

    const { toast } = useToast();

    const resolutionMutation = useMutation({
        mutationFn: async (resolution: string) => {
            const response = await axiosInstance.post(
                `/activity/${item.id}/resolve`,
                {
                    resolution,
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['activity'],
            });
            toast({
                title: 'Success',
                description: 'Request resolved successfully',
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

    const markAsReadMutation = useMutation({
        mutationFn: async (read: boolean) => {
            const response = await axiosInstance.post(
                `/activity/${item.id}/read`,
                {
                    read,
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['activity'],
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

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    key={item.id}
                    className={cn(
                        'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent'
                        //   mail.selected === item.id && "bg-muted"
                    )}
                >
                    <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div className="font-semibold">
                                    {item.title}
                                </div>
                                {!item.seen && (
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    'ml-auto text-xs',
                                    {
                                        'text-foreground': item.seen,
                                        'text-muted-foreground': !item.seen,
                                    }
                                )}
                            >
                                {formatDistanceToNow(new Date(item.createdAt), {
                                    addSuffix: true,
                                })}
                            </div>
                        </div>
                        <div className="text-xs font-medium">
                            {item.subject}
                        </div>
                    </div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">
                        {item.message?.substring(0, 300)}
                    </div>
                    <div className="flex items-center">
                        <Badge variant="default">{item.category}</Badge>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                {item.type === 'team_access_request' &&
                    item.resolution === 'pending' && (
                        <>
                            <ContextMenuItem
                                onClick={() =>
                                    resolutionMutation.mutate('approved')
                                }
                            >
                                Approve
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() =>
                                    resolutionMutation.mutate('rejected')
                                }
                            >
                                Deny
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                        </>
                    )}
                <ContextMenuItem
                    onClick={() => resolutionMutation.mutate('deleted')}
                >
                    Delete
                </ContextMenuItem>
                <ContextMenuSeparator />
                {item.seen ? (
                    <ContextMenuItem
                        onClick={() => markAsReadMutation.mutate(false)}
                    >
                        Mark as Unread
                    </ContextMenuItem>
                ) : (
                    <ContextMenuItem
                        onClick={() => markAsReadMutation.mutate(true)}
                    >
                        Mark as Read
                    </ContextMenuItem>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
}
