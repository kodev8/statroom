import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, PencilLine, StarOff, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Input } from '@/components/ui/input';

import { AxiosError } from 'axios';
import { useToast } from '@/components/hooks/use-toast';
import axiosInstance from '@/constants/axios';
import baseRoutes from '@/constants/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectRowProps } from '@/components/projects/ProjectTable';
import { useState } from 'react';
import { useUserStore } from '@/stores/user.store';
import { StarFilledIcon } from '@radix-ui/react-icons';

const ProjectActions = ({ project }: ProjectRowProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const user = useUserStore((state) => state.user);

    const [projectNameVerification, setProjectNameVerification] = useState('');

    const deletProjectMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete(
                `/projects/${project.id}`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Project deleted successfully',
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

    const addToFavoritesMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post(
                `/projects/${project.id}/favorite`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Project added to favorites',
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

    const removeFromFavoritesMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete(
                `/projects/${project.id}/favorite`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Project removed from favorites',
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
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                        className="dark:bg-slate-500"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="space-y-1">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    {!project.favorite ? (
                        <DropdownMenuItem asChild>
                            <Button
                                onClick={() => addToFavoritesMutation.mutate()}
                                variant="ghost"
                                size={'sm'}
                                className="w-full justify-start bg-none dark:bg-slate-900 dark:text-white"
                            >
                                <StarFilledIcon className="h-4 w-4 mr-2 text-yellow-300" />
                                Favorite
                            </Button>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild>
                            <Button
                                onClick={() =>
                                    removeFromFavoritesMutation.mutate()
                                }
                                variant="ghost"
                                size={'sm'}
                                className="w-full justify-start bg-none dark:bg-slate-900 dark:text-white"
                            >
                                <StarOff className="h-4 w-4 mr-2" />
                                Unfavorite
                            </Button>
                        </DropdownMenuItem>
                    )}
                    {project.owner === user?.email && (
                        <>
                            <DropdownMenuItem asChild>
                                <Button
                                    onClick={() =>
                                        navigate(
                                            `${baseRoutes.projects}/${project.id}`,
                                            {
                                                state: {
                                                    mode: 'edit',
                                                    from: {
                                                        pathname:
                                                            baseRoutes.projects,
                                                    },
                                                },
                                            }
                                        )
                                    }
                                    variant="ghost"
                                    size={'sm'}
                                    className="w-full justify-start bg-none dark:bg-slate-900 dark:text-white"
                                >
                                    <PencilLine className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full justify-start"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="grid gap-2">
                            <p>
                                This action cannot be undone. This will
                                permanently delete your project "
                                <strong className="text-black">
                                    {project.name}
                                </strong>
                                " and remove its data from our servers.
                            </p>
                            <Input
                                placeholder={`Type the project name: '${project.name}' to confirm`}
                                onChange={(e) =>
                                    setProjectNameVerification(e.target.value)
                                }
                            />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="disabled:bg-red-300 bg-red-500 hover:bg-red-600"
                        disabled={projectNameVerification !== project.name}
                        onClick={() => deletProjectMutation.mutate()}
                    >
                        Confirm delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ProjectActions;
