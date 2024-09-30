import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link, useParams } from 'react-router-dom';
import TeamCard, { TeamProps } from '@/components/TeamCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    emailSchema,
    generateDefaultValuesFromSchema,
    teamSchema,
    TEmailSchema,
    TTeamSchema,
} from '#/types/schemas';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import RoleCombobox from '@/components/teams/RoleCombobox';
import { Separator } from '@/components/ui/separator';
import axiosInstance from '@/constants/axios';
import { useToast } from '@/components/hooks/use-toast';
import {
    useMutation,
    useQuery,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import { useUserStore } from '@/stores/user.store';
import { AxiosError } from 'axios';
import baseRoutes from '@/constants/routes';
import { TProject } from '#/types/project';
import { TMember } from '#/types/user';
import ReactLoading from 'react-loading';
import { format } from 'date-fns';
import { useCrumb } from '@/components/hooks/useCrumb';


function Teams() {
    const user = useUserStore((state) => state.user);

    const { toast } = useToast();

    const { id: activeTeamId } = useParams();

    const [addMemberIsOpen, setAddMemberIsOpen] = useState(false);

    const { setCrumbLabel } = useCrumb();

    const fetchTeamsLoader = async () => {
        const response = await axiosInstance.get('/teams');
        return response.data;
    };
    
    const {
        isPending,
        isError,
        data: teams,
    } = useQuery({
        queryKey: ['teams'],
        queryFn: fetchTeamsLoader,
        placeholderData: keepPreviousData,
    });

    const {
        isError: activeTeamError,
        isPending: activeTeamPending,
        data: activeTeam,
    } = useQuery({
        queryKey: ['activeTeam', activeTeamId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/teams/${activeTeamId}`);
            return response.data;
        },
        enabled: !!activeTeamId,
    });

    useEffect(() => {
        // cleanup crumb 
        
        if (activeTeam) { 
            setCrumbLabel(activeTeam.name);
        }

        return () => {
            setCrumbLabel('');
        };
    }, [activeTeam, setCrumbLabel]);

    const [addTeamIsOpen, setAddTeamIsOpen] = useState(false);

    const addTeamForm = useForm<TTeamSchema>({
        resolver: zodResolver(teamSchema),
        defaultValues: generateDefaultValuesFromSchema(teamSchema),
    });

    const {
        isDirty: addTeamIsDirty,
        isValid: addTeamIsValid,
        isSubmitting: addTeamIsSubmitting,
    } = addTeamForm.formState;

    const addMemberForm = useForm<TEmailSchema>({
        resolver: zodResolver(emailSchema),
        defaultValues: generateDefaultValuesFromSchema(emailSchema),
    });

    const {
        isDirty: addMemberIsDirty,
        isValid: addMemberIsValid,
        isSubmitting: addMemberIsSubmitting,
    } = addMemberForm.formState;

    const queryClient = useQueryClient();
    const addTeamMutation = useMutation({
        mutationFn: async (data: TTeamSchema) => {
            const response = await axiosInstance.post('/teams', data);
            return response.data;
        },
        onSuccess: (_data) => {
            addTeamForm.reset();
            setAddTeamIsOpen(false);
            // setMyTeams([...myTeams, data]);
            toast({
                title: 'Success',
                description: 'Team created successfully',
                variant: 'success',
            });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
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
    const addTeamOnSubmit = async (data: TTeamSchema) => {
        addTeamMutation.mutate(data);
    };

    const addMemberMutation = useMutation({
        mutationFn: async (data: TEmailSchema) => {
            await axiosInstance.post(`/teams/${activeTeamId}/invites`, data);
        },
        onSuccess: () => {
            addMemberForm.reset();
            setAddMemberIsOpen(false);
            toast({
                title: 'Success',
                description: 'Invitation sent successfully',
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

    const addMemberOnSubmit = async (data: TEmailSchema) => {
        addMemberMutation.mutate(data);
    };

    let mainContent;
    if (isPending) {
        mainContent = (
            <div className="flex items-center justify-center w-full h-full">
                <ReactLoading type="spin" color="#000" />
            </div>
        );
    } else if (isError) {
        mainContent = (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-lg font-medium text-muted-foreground">
                    Could not load teams.
                </p>
            </div>
        );
    } else {
        mainContent = (
            <ScrollArea className="w-full h-[50%] md:min-h-[400px] rounded-md border !z-[5]">
                <div className="grid gap-4">
                    <div className="col-span-full flex p-8  z-10 sticky top-0 bg-white text-black dark:bg-black dark:text-white">
                        <h2 className="font-semibold">My Teams</h2>
                        <Dialog
                            open={addTeamIsOpen}
                            onOpenChange={setAddTeamIsOpen}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-7 gap-1 ml-auto">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Create New Team
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="underline">
                                        Create a new Team
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add a new team with team members to
                                        start collaborating on projects.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...addTeamForm}>
                                    <form
                                        className="grid gap-4 py-4"
                                        onSubmit={addTeamForm.handleSubmit(
                                            addTeamOnSubmit
                                        )}
                                    >
                                        <FormField
                                            control={addTeamForm.control}
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
                                            control={addTeamForm.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !addTeamIsDirty ||
                                                    !addTeamIsValid
                                                }
                                                isLoading={addTeamIsSubmitting}
                                            >
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] h-full gap-y-8 gap-x-4  px-8">
                        {!teams?.myTeams?.length ? (
                            <div className="flex items-center justify-center w-full h-full">
                                <p className="text-lg font-medium text-muted-foreground">
                                    Create a new team to get started.
                                </p>
                            </div>
                        ) : (
                            teams.myTeams.map((team: TeamProps) => (
                                <TeamCard
                                    key={team.id}
                                    team={team}
                                    active={activeTeamId == team.id}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="grid gap-4 my-2">
                    <h2 className="col-span-full p-8 font-semibold z-2 sticky top-0 bg-transparent dark:bg-black dark:text-white">
                        Other Teams
                    </h2>

                    <div className="grid md:grid-cols-2 md:gap-8 lg:grid-cols-4 px-8 pb-8">
                        {!teams?.otherTeams?.length ? (
                            <div className="flex items-center w-full h-full">
                                <p className="text-lg font-medium text-muted-foreground w-full">
                                    When you join other teams, they will appear
                                    here.
                                </p>
                            </div>
                        ) : (
                            teams.otherTeams.map((team: TeamProps) => (
                                <TeamCard key={team.id} team={team} />
                            ))
                        )}
                    </div>
                </div>
            </ScrollArea>
        );
    }

    let content;
    if (!activeTeamId) {
        content = (
            <div className="flex items-center justify-center w-full h-full">
                {(teams?.myTeams?.length > 0 ||
                    teams?.otherTeams?.length > 0) && (
                    <p className="text-lg font-medium text-muted-foreground">
                        Click on a team to view details.
                    </p>
                )}
            </div>
        );
    } else if (activeTeamPending) {
        content = (
            <div className="flex items-center justify-center w-full h-full">
                <ReactLoading type="bubbles" color="#000" />
            </div>
        );
    } else if (activeTeamError) {
        content = (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-lg font-medium text-muted-foreground">
                    Could not load team details.
                </p>
            </div>
        );
    } else {
        content = (
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
                <Card className="">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Team / Projects</CardTitle>
                            <CardDescription>
                                View the projects for the selected team.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeTeam?.projects?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead className="hidden lg:table-cell">
                                            Sport
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell">
                                            Status
                                        </TableHead>

                                        <TableHead className="hidden xl:table-cell">
                                            Date
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeTeam.projects.map(
                                        (project: TProject) => (
                                            <TableRow key={project.id}>
                                                <TableCell>
                                                    <Link
                                                        to={`${baseRoutes.projects}/${project.id}`}
                                                        className="font-medium"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="table-cell">
                                                    {project.sport}
                                                </TableCell>
                                                <TableCell className="table-cell">
                                                    <Badge variant={'outline'}>
                                                        {project.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="table-cell">
                                                    {format(
                                                        new Date(
                                                            project.createdAt
                                                        ),
                                                        'PP'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <p className="text-lg font-medium text-muted-foreground">
                                    The team has no projects yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row justify-between">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage and invite your team members to
                                collaborate.
                            </CardDescription>
                        </div>

                        {activeTeam?.owner === user?.email && (
                            <Dialog
                                open={addMemberIsOpen}
                                onOpenChange={setAddMemberIsOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="h-7 gap-1 w-fit"
                                    >
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                            Add Member
                                        </span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle className="grid gap-2">
                                            <span className="underline">
                                                {' '}
                                                {activeTeam.name} / New member
                                            </span>
                                            <p className="text-xs text-muted-foreground text-decor">
                                                id: #{activeTeam.id}
                                            </p>
                                        </DialogTitle>
                                        <DialogDescription>
                                            Add a new member to the team to
                                            start collaborating.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {addMemberIsSubmitting ? (
                                        <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 flex items-center justify-center z-50">
                                            <ReactLoading
                                                type="spin"
                                                color="#000"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex space-x-2">
                                                <Input
                                                    value={`${window.location.origin}${baseRoutes.teamInvites}/${activeTeam.id}`}
                                                    readOnly
                                                />
                                                <Button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(
                                                            `${window.location.origin}${baseRoutes.teamInvites}/${activeTeam.id}`
                                                        );
                                                        toast({
                                                            title: 'Success',
                                                            description:
                                                                'Link copied to clipboard',
                                                            variant: 'success',
                                                        });
                                                    }}
                                                    variant="secondary"
                                                    className="shrink-0"
                                                >
                                                    Copy Link
                                                </Button>
                                            </div>
                                            <Separator orientation="horizontal" />
                                            <Form {...addMemberForm}>
                                                <form
                                                    onSubmit={addMemberForm.handleSubmit(
                                                        addMemberOnSubmit
                                                    )}
                                                >
                                                    <div className="grid gap-4 py-4">
                                                        <FormField
                                                            control={
                                                                addMemberForm.control
                                                            }
                                                            name="email"
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Email
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

                                                    <DialogFooter>
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                !addMemberIsDirty ||
                                                                !addMemberIsValid ||
                                                                addMemberIsSubmitting
                                                            }
                                                        >
                                                            Send Invite
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {activeTeam?.members.length ? (
                            activeTeam?.members.map(
                                (member: TMember) => (
                                    <div
                                        key={member.email}
                                        className="flex items-center justify-between space-x-4"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarImage
                                                    src={member.picture}
                                                />
                                                <AvatarFallback>
                                                    {member.fname?.[0]}
                                                    {member.lname?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">
                                                    {member.fname}{' '}
                                                    {member.lname}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>

                                        {user?.email === activeTeam?.owner &&
                                        member.role !== 'owner' ? (
                                            <RoleCombobox
                                                member={member}
                                                activeTeamId={activeTeamId}
                                            />
                                        ) : (
                                            <Badge variant="outline">
                                                {member.role}
                                            </Badge>
                                        )}
                                    </div>
                                )
                            )
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <p className="text-lg font-medium text-muted-foreground">
                                    Add team members to get started.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {mainContent}
            {content}
        </main>
    );
}

export default Teams;
