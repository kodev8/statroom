import { useState } from 'react';
import { TProject } from '#/types/project';
import baseRoutes from '@/constants/routes';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { PROJECT_PAGE_SIZE } from '#/shared/constants';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Tag } from '@/components/Tags';
import ReactLoading from 'react-loading';
import { Badge } from '@/components/ui/badge';
import ProjectActions from '@/components/projects/ProjectActions';
import { StatRoomLogo } from '../Icons';
import { StarFilledIcon } from '@radix-ui/react-icons';

export type ProjectRowProps = {
    project: TProject;
};

type ProjectTableProps = {
    tab: string;
};

const getMessages = (tab: string) => {
    switch (tab) {
        case 'active':
            return {
                title: 'Active projects',
                description: 'View all your projects with recent activity',
                noProjects: 'You have no active projects.',
            };
        case 'processing':
            return {
                title: 'Processing projects',
                description: 'View all your projects with pending requests',
                noProjects: 'No projects have pending processes.',
            };
        case 'archived':
            return {
                title: 'Archived projects',
                description: 'Your projects that are put away for now',
                noProjects: 'You have no archived projects.',
            };
        default:
            return {
                title: 'All projects',
                description: 'View all your projects in one place',
                noProjects: 'You have no projects! Create one now.',
            };
    }
};

const ProjectTable = ({ tab }: ProjectTableProps) => {
    let content;
    let successFooter;
    const { title, description, noProjects } = getMessages(tab);
    const [page, setPage] = useState(1);

    const queryBuilder = (tab: string, page: number) => {
        if (tab === 'all') {
            return `/projects?page=${page}`;
        }
        return `/projects?page=${page}&status=${tab}`;
    };

    const {
        isPending,
        isError,
        isSuccess,
        data: projectData,
    } = useQuery({
        queryKey: ['projects', tab, page],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const response = await axiosInstance.get(queryBuilder(tab, page));
            return response.data;
        },
    });

    if (isError) {
        content = <div>There was an error fetching the projects</div>;
    } else if (isPending) {
        content = (
            <div className="flex w-full items-center justify-center">
                <ReactLoading type="spin" color="#000" />
            </div>
        );
    } else if (projectData.projects?.length) {
        content = (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tags</TableHead>

                        <TableHead className="hidden md:table-cell">
                            Created at
                        </TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projectData.projects.map((project: TProject) => (
                        <ProjectRow key={project.id} project={project} />
                    ))}
                </TableBody>
            </Table>
        );
    } else {
        content = <div>{noProjects}</div>;
    }

    if (isSuccess && projectData.projects?.length > 0) {
        successFooter = (
            <>
                <div className="flex w-full justify-between text-xs text-muted-foreground">
                    {projectData.projects?.length > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                                Showing{' '}
                                <strong>
                                    {page} -{' '}
                                    {page === projectData.maxPage
                                        ? projectData.totalProjects
                                        : page * PROJECT_PAGE_SIZE}
                                </strong>{' '}
                                of <strong>{projectData.totalProjects}</strong>{' '}
                                projects
                            </span>
                        </div>
                    )}
                </div>
                <Pagination className="justify-end">
                    <PaginationContent>
                        <PaginationItem>
                            {page > 1 ? (
                                <PaginationPrevious
                                    onClick={() =>
                                        setPage((prev: number) => {
                                            if (prev <= 1) return prev;
                                            return prev - 1;
                                        })
                                    }
                                    className="cursor-pointer"
                                />
                            ) : (
                                <PaginationPrevious className="cursor-not-allowed text-gray-400 hover:bg-transparent hover:text-gray-400" />
                            )}
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink>{page}</PaginationLink>
                        </PaginationItem>

                        {page < projectData.maxPage ? (
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        setPage((prev: number) => {
                                            // if (projectData.length < 10) return prev;
                                            return prev + 1;
                                        })
                                    }
                                    className="cursor-pointer"
                                />
                            </PaginationItem>
                        ) : (
                            <PaginationNext className="cursor-not-allowed text-gray-400 hover:bg-transparent hover:text-gray-400" />
                        )}
                    </PaginationContent>
                </Pagination>
            </>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{content}</CardContent>

            <CardFooter>{successFooter}</CardFooter>
        </Card>
    );
};

export default ProjectTable;

const ProjectRow = ({ project }: ProjectRowProps) => {
    return (
        <TableRow>
            <TableCell className="hidden sm:table-cell">
                {project.thumbnail ? (
                    <img
                        alt="Project"
                        className="aspect-square rounded-md object-contain"
                        height="64"
                        src={project.thumbnail}
                        width="64"
                    />
                ) : (
                    <StatRoomLogo asIcon height={40} width={40} />
                )}
            </TableCell>
            <TableCell className="font-medium">
                <Link
                    to={`${baseRoutes.projects}/${project.id}`}
                    className="text-primary flex items-center"
                >
                    {project.name}
                    {project.favorite && (
                        <StarFilledIcon className="h-4 w-4 ml-2 text-yellow-300 " />
                    )}
                </Link>
            </TableCell>
            <TableCell>
                <Badge variant="outline">{project.status}</Badge>
            </TableCell>
            <TableCell>
                <div className="flex gap-2 flex-wrap max-w-[60%]">
                    {project.tags?.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {new Date(project.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <ProjectActions project={project} />
            </TableCell>
        </TableRow>
    );
};
