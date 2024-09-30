import { ChevronLeft, Flame, PlusCircle, Upload, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Tag } from '@/components/Tags';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectSelect from './ProjectSelect';
import { useForm } from 'react-hook-form';

import {
    categories,
    editProjectSchema,
    leagues,
    TEditProjectSchema,
} from '#/types/schemas';
import { toTitleCase } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import axiosInstance from '@/constants/axios';
import { useProject } from '../hooks/useProject';
import { Status } from '#/types/project';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/hooks/use-toast';
import { AxiosError } from 'axios';
import setTitle from '@/components/hooks/set-title';
import baseRoutes from '@/constants/routes';
import ProjectClips from './ProjectClips';


export default function ProjectEdit() {
    const navigate = useNavigate();
    const { project, from, setMode } = useProject();

    setTitle(`Edit Project - ${project?.name}`);

    const { id } = useParams();
    const queryClient = new QueryClient();
    const [thumbnail, setThumbnail] = useState<string | undefined>(
        project?.thumbnail
    );
    const editProjectForm = useForm<TEditProjectSchema>({
        resolver: zodResolver(editProjectSchema),
        defaultValues: {
            name: project?.name,
            description: project?.description,
            tags: project?.tags,
            sport: project?.sport,
            league: project?.league,
            category: project?.category,
            status: project?.status,
            thumbnail: project?.thumbnail,
        },
    });

    const [tags, setTags] = useState<string[]>([]);
    const { toast } = useToast();
    const {
        getValues,
        setValue,
        // formState: { isSubmitting, isDirty, isValid },
    } = editProjectForm;

    const editProjectMutation = useMutation({
        mutationFn: async (data: TEditProjectSchema) => {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('tags', JSON.stringify(data.tags));
            formData.append('sport', data.sport);

            if(data.league) formData.append('league', data.league);
            if(data.category) formData.append('category', data.category);
            if(data.status) formData.append('status', data.status);
            formData.append(
                'thumbnail',
                editProjectForm.getValues('thumbnail')
            );

            const response = await axiosInstance.put(
                `/projects/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['projects'],
            });
            queryClient.invalidateQueries({
                queryKey: ['project', id],
            });
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Project updated successfully',
            });

            if (from === baseRoutes.projects) {
                navigate(from, { replace: true });
            } else {
                setMode('view');
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
        onSettled: () => {
            editProjectForm.reset();
        },
    });

    const onSubmit = async (data: TEditProjectSchema) => {
        editProjectMutation.mutate(data);
    };

    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Form {...editProjectForm}>
                <form
                    className="mx-auto grid flex-1 auto-rows-max gap-4"
                    onSubmit={editProjectForm.handleSubmit(onSubmit)}
                    encType="multipart/form-data"
                >
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            className="h-7 w-7"
                            onClick={() => {
                                navigate(-1);
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>

                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            {project?.name}
                        </h1>
                        <Badge variant="outline" className="ml-auto sm:ml-0">
                            {project?.status as Status}
                        </Badge>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setMode('view');
                                }}
                            >
                                Discard
                            </Button>
                            <Button size="sm">Save Project</Button>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Details</CardTitle>
                                    <CardDescription>
                                        View and edit project details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <FormField
                                                control={
                                                    editProjectForm.control
                                                }
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <FormField
                                                control={
                                                    editProjectForm.control
                                                }
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Description
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                id="description"
                                                                className="min-h-32"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <div className="grid gap-3">
                                                <FormField
                                                    control={
                                                        editProjectForm.control
                                                    }
                                                    name="latestTag"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Tags{' '}
                                                                <span className="text-muted-foreground">
                                                                    (optional)
                                                                </span>
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Add tags to help
                                                                categorize your
                                                                projects
                                                            </FormDescription>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Enter a new tag here"
                                                                    {...field}
                                                                    id="latest-tag"
                                                                    type="text"
                                                                    className="w-full"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button
                                                variant={'ghost'}
                                                size={'sm'}
                                                className="w-fit"
                                                type="button"
                                                onClick={() => {
                                                    // add tag
                                                    if (
                                                        !getValues(
                                                            'latestTag'
                                                        ) ||
                                                        getValues(
                                                            'tags'
                                                        )?.includes(
                                                            getValues(
                                                                'latestTag'
                                                            ) as string
                                                        )
                                                    )
                                                        return;
                                                    if (
                                                        getValues('tags')
                                                            ?.length === 5
                                                    ) {
                                                        toast({
                                                            variant: 'default',
                                                            title: 'Error',
                                                            description:
                                                                'You can only add up to 5 tags',
                                                        });
                                                        return;
                                                    }
                                                    setValue(
                                                        'tags',
                                                        [
                                                            ...(getValues(
                                                                'tags'
                                                            ) as string[]),
                                                            getValues(
                                                                'latestTag'
                                                            ) as string,
                                                        ],
                                                        {
                                                            shouldDirty: true,
                                                            shouldValidate:
                                                                true,
                                                        }
                                                    );
                                                    setTags([
                                                        ...tags,
                                                        getValues(
                                                            'latestTag'
                                                        ) as string,
                                                    ]);
                                                    editProjectForm.resetField(
                                                        'latestTag',
                                                        {
                                                            keepDirty: false,
                                                        }
                                                    );
                                                    setValue('latestTag', '');
                                                }}
                                            >
                                                <PlusCircle className="h-3.5 w-3.5" />
                                                Add Tag
                                            </Button>

                                            <div className="flex gap-4">
                                                {getValues('tags')?.map(
                                                    (tag, index) => (
                                                        <Tag
                                                            key={`${tag}-${index}`}
                                                            editable
                                                            onClick={() => {
                                                                // remove tag
                                                                setValue(
                                                                    'tags',
                                                                    getValues(
                                                                        'tags'
                                                                    )?.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            index
                                                                    )
                                                                );
                                                                setTags(
                                                                    tags.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            index
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            {tag}
                                                        </Tag>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Data</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 sm:grid-cols-3">
                                        <div className="grid gap-3">
                                            <ProjectSelect
                                                form={editProjectForm}
                                                label="Sport"
                                                name="sport"
                                                placeholder="Select sport"
                                                items={[
                                                    {
                                                        label: 'Football',
                                                        value: 'football',
                                                    },
                                                ]}
                                            >
                                                <span className="flex gap-2 text-sm items-center bg-blue-200 p-2">
                                                    <Flame className="w-4 h-4" />{' '}
                                                    More coming soon
                                                </span>
                                            </ProjectSelect>
                                        </div>
                                        <div className="grid gap-3">
                                            <ProjectSelect
                                                form={editProjectForm}
                                                label="League"
                                                name="league"
                                                placeholder="Select league"
                                                items={leagues.map((league) => ({
                                                    label: toTitleCase(league),
                                                    value: league,
                                                }))}
                                                withDeselect
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <ProjectSelect
                                                form={editProjectForm}
                                                label="Category"
                                                name="category"
                                                placeholder="Select category"
                                                items={categories.map((category) => ({
                                                    label: toTitleCase(category),
                                                    value: category
                                                }))}
                                                
                                                withDeselect
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <ProjectSelect
                                                form={editProjectForm}
                                                label="Status"
                                                name="status"
                                                placeholder="Select status"
                                                items={[
                                                    {
                                                        label: 'Active',
                                                        value: 'active',
                                                    },
                                                    {
                                                        label: 'Archived',
                                                        value: 'archived',
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Project Clips</CardTitle>
                                    <CardDescription>
                                        View project clips
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-2 items-center justify-center">
                                        <ProjectClips clips={[]} />
                                        <div>
                                            <h3 className="text-sm my-2">
                                                Upload your thumbnail
                                            </h3>

                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="relative">
                                                    {thumbnail && (
                                                        <XCircle
                                                            className="h-4 w-4 text-slate-400 hover:text-red-500 absolute -top-2 -left-2 cursor-pointer"
                                                            onClick={() =>
                                                                setThumbnail(
                                                                    undefined
                                                                )
                                                            }
                                                        />
                                                    )}
                                                    <img
                                                        alt="Project"
                                                        className="aspect-square w-full rounded-md object-cover"
                                                        height="84"
                                                        src={
                                                            thumbnail ??
                                                            '/placeholder.jpeg'
                                                        }
                                                        width="84"
                                                    />
                                                </div>

                                                <FormField
                                                    control={
                                                        editProjectForm.control
                                                    }
                                                    name="thumbnail"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FormLabel
                                                                    htmlFor="thumbnail"
                                                                    className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed"
                                                                >
                                                                    <Upload className="h-4 w-4 text-muted-foreground" />

                                                                    <input
                                                                        {...field}
                                                                        value=""
                                                                        type="file"
                                                                        id="thumbnail"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const file =
                                                                                e
                                                                                    .target
                                                                                    .files?.[0];
                                                                            if (
                                                                                !file
                                                                            )
                                                                                return;

                                                                            const reader =
                                                                                new FileReader();
                                                                            reader.onload =
                                                                                (
                                                                                    e
                                                                                ) => {
                                                                                    setThumbnail(
                                                                                        e
                                                                                            .target
                                                                                            ?.result as string
                                                                                    );
                                                                                };
                                                                            reader.readAsDataURL(
                                                                                file
                                                                            );
                                                                            editProjectForm.setValue(
                                                                                'thumbnail',
                                                                                e
                                                                                    .target
                                                                                    .files?.[0]
                                                                            );
                                                                        }}
                                                                    />
                                                                    <span className="sr-only">
                                                                        Upload
                                                                    </span>
                                                                </FormLabel>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setMode('view');
                            }}
                        >
                            Discard
                        </Button>
                        <Button size="sm">Save Project</Button>
                    </div>
                </form>
            </Form>
        </main>
    );
}
