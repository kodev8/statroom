import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/pages/Productivity/Dashboard/Sidebar';
import { Activity } from '@/pages/Productivity/Dashboard/Activty';
import { ProjectThumbnail } from '@/pages/Productivity/Dashboard/ProjectThumbnail';
import { useQueries, keepPreviousData } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { TProject } from '#/types/project';
import ReactLoading from 'react-loading';
import setTitle from '@/components/hooks/set-title';

const FavoriteFallBack = () => {
    return (
        <div className="flex items-center justify-center min-h-72 w-full">
            <h3 className="text-lg font-semibold text-muted-foreground">
                Try favoriting some projects to get started
            </h3>
        </div>
    );
};

const RecentFallBack = () => {
    return (
        <div className="flex items-center w-full">
            <h3 className="text-lg font-semibold text-muted-foreground">
                Check out some projects to get started
            </h3>
        </div>
    );
};

export default function DashboardPage() {
    setTitle('Dashboard');

    const [favoritesQuery, recentQuery] = useQueries({
        queries: [
            {
                queryKey: ['projects', 'favorites'],
                placeholderData: keepPreviousData,
                queryFn: async () => {
                    const response = await axiosInstance.get(
                        '/projects/favorites'
                    );
                    return response.data;
                },
            },
            {
                queryKey: ['projects', 'recent'],
                placeholderData: keepPreviousData,
                queryFn: async () => {
                    const response =
                        await axiosInstance.get('/projects/recent');
                    return response.data;
                },
            },
        ],
    });

    const {
        isPending: favoritesPending,
        isError: favoritesError,
        isSuccess: favoritesSuccess,
        data: favoritesData,
    } = favoritesQuery;

    const {
        isPending: recentPending,
        isError: recentError,
        isSuccess: recentSuccess,
        data: recentData,
    } = recentQuery;

    let favoriteContnet = null;
    if (favoritesPending) {
        favoriteContnet = <ReactLoading type="cylon" color="#000" />;
    }
    if (favoritesError) {
        favoriteContnet = <FavoriteFallBack />;
    }
    if (favoritesSuccess) {
        favoriteContnet =
            favoritesData?.projects?.length > 0 ? (
                favoritesData.projects.map((project: TProject) => (
                    <ProjectThumbnail
                        key={project.id}
                        project={project}
                        className="w-[250px]"
                        aspectRatio="portrait"
                        width={250}
                        height={330}
                    />
                ))
            ) : (
                <FavoriteFallBack />
            );
    }

    let recentContent = null;
    if (recentPending) {
        recentContent = <ReactLoading type="cylon" color="#000" />;
    }
    if (recentError) {
        recentContent = <RecentFallBack />;
    }
    if (recentSuccess) {
        recentContent =
            recentData?.projects?.length > 0 ? (
                recentData?.projects?.map((project: TProject) => (
                    <ProjectThumbnail
                        key={project.id}
                        project={project}
                        className="w-[150px]"
                        aspectRatio="square"
                        width={150}
                        height={150}
                    />
                ))
            ) : (
                <RecentFallBack />
            );
    }

    return (
        <div className="hidden md:block h-full">
            <div className="border-t h-full">
                <div className="bg-background h-full">
                    <div className="grid lg:grid-cols-5 h-full">
                        <Sidebar className="hidden lg:block h-full" />
                        <div className="col-span-3 lg:col-span-4 lg:border-l h-full">
                            <div className="h-full px-4 py-6 lg:px-8">
                                <Tabs
                                    defaultValue="projects"
                                    className="h-full space-y-6"
                                >
                                    <div className="space-between flex items-center">
                                        <TabsList>
                                            <TabsTrigger
                                                value="projects"
                                                className="relative"
                                            >
                                                Projects
                                            </TabsTrigger>
                                            <TabsTrigger value="activity">
                                                Activity
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <TabsContent
                                        value="projects"
                                        className="border-none p-0 outline-none"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h2 className="text-2xl font-semibold tracking-tight">
                                                    Favourite Projects
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Star your favorite projects
                                                    to access them quickly!
                                                </p>
                                            </div>
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="flex relative h-full">
                                            <ScrollArea>
                                                <div className="flex space-x-4 pb-4">
                                                    {favoriteContnet}
                                                </div>
                                                <ScrollBar orientation="horizontal" /> 
                                            </ScrollArea>
                                        </div>
                                        <div className="mt-6 space-y-1">
                                            <h2 className="text-2xl font-semibold tracking-tight">
                                                Your recent projects
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Your projects that you have
                                                recently visited.
                                            </p>
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="relative">
                                            <ScrollArea>
                                                <div className="flex space-x-4 pb-4">
                                                    {recentContent}
                                                </div>
                                                <ScrollBar orientation="horizontal" />
                                            </ScrollArea>
                                        </div>
                                    </TabsContent>
                                    <TabsContent
                                        value="activity"
                                        className="h-full flex-col border-none p-0 data-[state=active]:flex"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h2 className="text-2xl font-semibold tracking-tight">
                                                    Recenty activity
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Your project's activity.
                                                    Updated daily.
                                                </p>
                                            </div>
                                        </div>
                                        <Separator className="my-4" />
                                        <Activity />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
