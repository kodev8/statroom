import axiosInstance from '@/constants/axios';
import baseRoutes from '@/constants/routes';
import { useUserStore } from '@/stores/user.store';
import { useMutation, useQueries } from '@tanstack/react-query';
import {
    Navigate,
    useLocation,
    useNavigate,
    useParams,
} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/hooks/use-toast';
import { AxiosError } from 'axios';
import ReactLoading from 'react-loading';

type TInviteResolution = 'accept' | 'decline';

function TeamInvite() {
    const location = useLocation();
    const navigate = useNavigate();

    const { id: teamId } = useParams();
    const token = new URLSearchParams(location.search).get('token');
    const { toast } = useToast();
    const from = location.state?.from;
    // check if the user is logged in
    // if not, redirect to login then continue with flow // should be handled by private route

    // if yes, check if the user is already part of the team
    // if yes, redirect to the team page

    // if no, check if the invite is valid (invites with tokens are sent via email, invites by link only require to request access from owner)
    // if yes, show the invite page
    // if no, show an error message

    // when user logs back in the should be redirected back to this component and the flow should continue
    const user = useUserStore((state) => state.user);

    const [teamDataRequest, userInTeamRequest, inviteRequest] = useQueries({
        queries: [
            {
                queryKey: ['team', teamId],
                queryFn: async () => {
                    const response = await axiosInstance.get(`/teams/${teamId}/public`);
                    return response.data;
                },
            },
            {
                queryKey: ['user-in-team', teamId, user?.id],
                queryFn: async () => {
                    // check if the user is already part of the team
                    const response = await axiosInstance.get(
                        `/teams/${teamId}/members/${user?.email}`
                    );
                    return response.data;
                },
            },
            {
                queryKey: ['team-invite', teamId],
                queryFn: async () => {
                    const response = await axiosInstance.get(
                        `/teams/${teamId}/invites/?token=${token}`
                    );
                    return response.data;
                },
                enabled: !!token,
            },
        
        ]
    });




    const inviteMutation = useMutation({
        mutationFn: async (inviteResolution: TInviteResolution) => {
            const response = await axiosInstance.post(
                `/teams/${teamId}/invites/${token}`,
                { resolution: inviteResolution }
            );
            return response.data;
        },
        onSuccess: () => {
            // redirect to team page
            if (inviteMutation.variables === 'decline') {
                toast({
                    title: 'Success',
                    description: 'You have declined the invite',
                    variant: 'default',
                });
                navigate(from || baseRoutes.home);
            } else if (inviteMutation.variables === 'accept') {
                toast({
                    title: 'Success',
                    description: 'You have successfully joined the team',
                    variant: 'success',
                });
                navigate(`${baseRoutes.teams}/${teamId}`);
            }
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

    const requsetAccessMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post(
                `/teams/${teamId}/invites/request-access`
            );
            return response.data;
        },
        onSuccess: () => {
            navigate(baseRoutes.teams);
            toast({
                title: 'Success',
                description: 'Request sent successfully',
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

    const { data: teamData, isPending: teamDataPending, isError: teamDataError } = teamDataRequest;
    const { data: userInTeam, isPending, isError } = userInTeamRequest;

    if (isPending || teamDataPending) {
        return (
            <div className="h-full w-full flex flex-col gap-y-6 justify-center items-center">
                <h3 className="text-xl font-semibold">Loading...</h3>
                <ReactLoading type="cylon" color="#000" />
            </div>
        );

    }

    if (isError || teamDataError) {
        return <div className='h-full w-full flex flex-col gap-y-6 justify-center items-center'>
            <h3 className='text-xl font-semibold'> We encountered an error </h3>
            <Button
                onClick={() => {
                    navigate(baseRoutes.teams);
                }}
            >
                Go back
            </Button>
        </div>
    }
    // check if the invite is valid

    const {
        data: invite,
        isPending: invitePending,
        isError: inviteError,
    } = inviteRequest;

    if (userInTeam?.isMember) {
        // redirect to the team page
        return <Navigate to={`${baseRoutes.teams}/${teamId}`} />;
    }

    console.log(teamData, userInTeam, invite);


    if (token) {
        if (invitePending) {
            return (
                <div className="h-full w-full flex flex-col gap-y-6 justify-center items-center">
                    <h3 className="text-xl font-semibold">
                        {' '}
                        We're getting you're invite
                    </h3>
                    <ReactLoading type="cylon" color="#000" />
                </div>
            );
        } else if (inviteError || !invite) {
            return (
                <div className="h-full w-full flex flex-col gap-y-6 justify-center items-center">
                    <h3 className="text-xl font-semibold">
                        {' '}
                        We're sorry, but we couldn't find your invite
                    </h3>
                    <Button
                    onClick={() => {
                        navigate(baseRoutes.teams);
                    }}
                    >
                        Go back
                    </Button>
                </div>
            );
        }
    }

    const handleAccept = (accepted: boolean) => {
        inviteMutation.mutate(accepted ? 'accept' : 'decline');
    };

    // show the invite page
    return (
        <div className="h-full w-full flex flex-col gap-y-6 mt-12 items-center">
            <h1 className="text-2xl font-bold">Team Invite</h1>

            {!token ? (
                <>
                    <p className="font-semibold">
                        You have been invited to join {teamData.owner}'s team: {teamData.name}
                        Please request access{' '}
                    </p>

                    <div className="space-x-2">
                        <Button
                            onClick={() => {
                                navigate(from || baseRoutes.home);
                            }}
                        >
                            Go back
                        </Button>
                        <Button
                            onClick={() =>requsetAccessMutation.mutate() }
                        >
                            Request Access
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <p className="font-semibold">
                        You have been invited to join {teamData.owner}'s team: {teamData.name}
                    </p>

                    <div className="space-x-2">
                        <Button onClick={() => handleAccept(true)}>
                            Accept
                        </Button>
                        <Button onClick={() => handleAccept(false)}>
                            Decline
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default TeamInvite;
