import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import baseRoutes from '@/constants/routes';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip';
import { PencilLine, Trash2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamSchema, TTeamSchema } from '#/types/schemas';
import axiosInstance from '@/constants/axios';
import { useToast } from '@/components/hooks/use-toast';
import { AxiosError } from 'axios';
import { useUserStore } from '@/stores/user.store';
import { TAuthUser } from '#/types/user';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { StatRoomLogo } from './Icons';
import AvatarPicker from './AvatarPicker';

export type TeamProps = {
    id: string;
    name: string;
    picture?: string;
    owner: string;
    description: string;
    members: number;
    createdAt: string;
    updatedAt: string;
};

type TeamCardProps = {
    team: TeamProps;
    active?: boolean;
};

type TeamCardChildProps = TeamCardProps & {
    setEdit: React.Dispatch<React.SetStateAction<boolean>>;
};

const TeamCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & TeamCardProps
>(({ team, active, ...props }, ref) => {
    const [edit, setEdit] = useState(false);
    const user = useUserStore((state) => state.user);
    return edit ? (
        <EditTeam setEdit={setEdit} team={team} ref={ref} {...props} />
    ) : (
        <ViewTeam
            team={team}
            user={user}
            setEdit={setEdit}
            ref={ref}
            active={active}
        />
    );
});

const ViewTeam = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> &
        TeamCardChildProps & { user: TAuthUser | null }
>(({ team, setEdit, user, active, ...props }, ref) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [deleteTeamVerification, setDeleteTeamVerification] = useState('');

    const deleteTeamMutation = useMutation({
        mutationFn: () => {
            const response = axiosInstance.delete(`/teams/${team.id}`);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['teams'],
            });
            toast({
                title: 'Team deleted successfully',
                description: 'The team has been deleted',
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
    return (
        <Card
            {...props}
            ref={ref}
            className={cn(
                'h-fit group transition-all duration-150 hover:border-indigo-300',
                {
                    'border-emerald-300 scale-[1.02]': active,
                }
            )}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="">
                    <CardTitle className="text-lg font-bold">
                        {team.name}
                    </CardTitle>

                    <CardDescription className="text-xs grid">
                        <span className="flex gap-1">
                            <span className="font-semibold flex">owner: </span>{' '}
                            {team.owner}
                        </span>
                        <span>{team.description}</span>
                    </CardDescription>
                </div>
                {team.owner === user?.email && (
                    <div
                        className={
                            'm-6 relative hidden group-hover:flex transition-all duration-200'
                        }
                    >
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEdit(true)}
                                className=" h-6 w-6"
                            >
                                <PencilLine className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-6 w-6"
                                            >
                                                <AlertDialogTrigger asChild>
                                                    <span>
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </span>
                                                </AlertDialogTrigger>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            Remove Team
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <div className="grid gap-2">
                                                <p>
                                                    This action cannot be
                                                    undone. This will
                                                    permanently delete your team
                                                    "
                                                    <strong>
                                                        {team.name}"
                                                    </strong>{' '}
                                                    and remove its data from our
                                                    servers. Any associated
                                                    projects will be privated.
                                                </p>
                                                <Input
                                                    onChange={(e) =>
                                                        setDeleteTeamVerification(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={`Type the team name:"${team.name}" to confirm`}
                                                />
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="disabled:bg-red-300 bg-red-500 hover:bg-red-600"
                                            disabled={
                                                deleteTeamVerification !==
                                                team.name
                                            }
                                            onClick={() =>
                                                deleteTeamMutation.mutate()
                                            }
                                        >
                                            Confirm delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex items-center justify-center flex-col">
                <Avatar className="flex items-center justify-center">
                    {team.picture ? (
                        <>
                            <AvatarImage
                                src={team.picture}
                                alt={team.name}
                                height={40}
                                width={40}
                            />
                            <AvatarFallback>{team.name}</AvatarFallback>
                        </>
                    ) : (
                        <StatRoomLogo asIcon height={40} width={40} />
                    )}
                </Avatar>
            </CardContent>
            <CardFooter className="border-t px-2 py-4 flex justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">
                        Created on{' '}
                        {format(new Date(team.createdAt), 'PP') ?? ''}
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {team.members} member{team.members === 1 ? '' : 's'}
                    </span>
                </div>

                <Button asChild variant={'ghost'} className="text-xs">
                    <NavLink to={`${baseRoutes.teams}/${team.id}`}>
                        Select Team
                    </NavLink>
                </Button>
            </CardFooter>
        </Card>
    );
});

const EditTeam = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & TeamCardChildProps
>(({ team, setEdit, ...props }, ref) => {
    const editTeamForm = useForm<TTeamSchema>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: team.name,
            description: team.description,
        },
    });

    const { toast } = useToast();

    const {
        formState: {
            isDirty: editTeamIsDirty,
            isSubmitting: editTeamIsSubmitting,
        },
    } = editTeamForm;

    const queryClient = useQueryClient();

    const editTeamMutation = useMutation({
        mutationFn: (data: TTeamSchema) => {
            const response = axiosInstance.patch(`/teams/${team.id}`, data);
            return response;
        },
        onSuccess: () => {
            editTeamForm.reset();
            setEdit(false);
            queryClient.invalidateQueries({
                queryKey: ['teams'],
            });
            toast({
                title: 'Team updated successfully',
                description: "The team's details have been updated",
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

    const editTeamOnSubmit = (data: TTeamSchema) => {
        editTeamMutation.mutate(data);
    };
    return (
        <Card {...props} ref={ref}>
            <CardHeader>
                <CardTitle>Edit Team</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...editTeamForm}>
                    <form
                        className="grid gap-4 py-4"
                        onSubmit={editTeamForm.handleSubmit(editTeamOnSubmit)}
                    >
                        <FormField
                            control={editTeamForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={editTeamForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <AvatarPicker form={editTeamForm} mode="team" name="picture" />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEdit(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!editTeamIsDirty}
                            isLoading={editTeamIsSubmitting}
                        >
                            Confirm
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
});

export default TeamCard;
