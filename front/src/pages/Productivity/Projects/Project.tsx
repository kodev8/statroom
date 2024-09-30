import ProjectEdit from '@/components/projects/ProjectEdit';
import ProjectView from '@/components/projects/ProjectView';
import axiosInstance from '@/constants/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, createContext, useMemo, useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { TProject } from '#/types/project';
import ReactLoading from 'react-loading';
import baseRoutes from '@/constants/routes';
import { TUserProjectRolesSchema } from '#/types/schemas';
import { useCrumb } from '@/components/hooks/useCrumb';

type ProjectMode = 'view' | 'edit';

type TProjectContext = {
    project: TProject;
    mode: ProjectMode;
    setMode: (mode: ProjectMode) => void;
    projectFetchError: boolean;
    projectFetchPending: boolean;
    from: string;
    role: TUserProjectRolesSchema['role'];
};

type TProjectLocationState = {
    mode: ProjectMode;
    from: {
        pathname: string;
    };
};

export const ProjectContext = createContext({} as TProjectContext);

function Project() {
    const { id } = useParams();
    const location = useLocation();
    const locationState = location.state as TProjectLocationState;
    const resolveFrom = locationState?.from ?? {
        pathname: baseRoutes.projects,
    };
    const [mode, setMode] = useState<ProjectMode>(
        locationState?.mode ?? 'view'
    );
    const { setCrumbLabel } = useCrumb();

    useEffect(() => {
        return () => {
            setCrumbLabel('');
        };
    }, [setCrumbLabel]);

    const queryClient = useQueryClient();

  
    const setRecentProjectMutation = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.post(`/projects/${id}/recent`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['projects', 'recent'],
            });
        },
        onError: () => {
            // Do nothing
        },
    });
    const {mutate} = setRecentProjectMutation;

    useEffect(() => {
         
        mutate(id as string);
    }, [id, mutate]);

    const {
        data,
        isError: projectFetchError,
        isPending: projectFetchPending,
    } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/projects/${id}`);
            return response.data;
        },
    });

    const contextValue = useMemo(
        () => ({
            project: data?.project,
            role: data?.role,
            mode,
            setMode,
            projectFetchError,
            projectFetchPending,
            from: resolveFrom.pathname,
        }),
        [
            data,
            mode,
            setMode,
            projectFetchError,
            projectFetchPending,
            resolveFrom.pathname,
        ]
    );

    useEffect(() => {
        if (data?.project) {
            setCrumbLabel(data.project.name);
        }
    }, [data?.project, setCrumbLabel]);

    if (projectFetchError) {
        return (
            <Navigate
                to={baseRoutes.projects}
                state={{
                    toast: {
                        title: 'Could not find project',
                        variant: 'default',
                    },
                }}
            />
        );
    }

    if (projectFetchPending) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <ReactLoading type="spin" color="#000" />
            </div>
        );
    }

    return (
        <ProjectContext.Provider value={contextValue}>
            <div>{mode === 'view' ? <ProjectView /> : <ProjectEdit />}</div>
        </ProjectContext.Provider>
    );
}

export default Project;
