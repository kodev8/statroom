import { useState } from 'react';

import {
    FilePlus,
    Folder as FolderIcon,
    FolderSymlink,
    TrashIcon,
} from 'lucide-react';

import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { folderSchema, TFoldersSchema } from '#/types/schemas';
import baseRoutes from '@/constants/routes';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TProject, TFolder } from '#/types/project';

type FolderComponent = {
    folder: TFolder
    projects: TProject[]
}
export interface FolderProps extends React.HTMLAttributes<HTMLDivElement> {
    item: FolderComponent 
}
export function Folder({ item, className, ...props }: Readonly<FolderProps>) {
    const [edit, setEdit] = useState(false);

    return (
        <div className={className} {...props}>
            {edit ? (
                <FolderEdit item={item} setEdit={setEdit} />
            ) : (
                <FolderView item={item} setEdit={setEdit} />
            )}
        </div>
    );
}

type FolderComponentProps = {
    item: FolderComponent
    setEdit: (value: boolean) => void;
};

const FolderView = ({ item, setEdit }: FolderComponentProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const deleteFolderMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete(
                `/projects/folders/${item.folder.id}`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['folders'],
            });
            queryClient.invalidateQueries({
                queryKey: ['projects', 'no-folder'],
            });
            toast({
                title: 'Success',
                description: 'Folder deleted',
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

    const removeProjectFromFolderMutation = useMutation({
        mutationFn: async (projectId: number | string) => {
            const response = await axiosInstance.delete(
                `/projects/${projectId}/folders/${item.folder.id}`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['folders'],
            });
            queryClient.invalidateQueries({
                queryKey: ['projects', 'no-folder'],
            });
            toast({
                title: 'Success',
                description: 'Project removed from folder',
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

    const addProjectToFolderMutation = useMutation({
        mutationFn: async (projectId: number | string) => {
            const response = await axiosInstance.post(
                `/projects/${projectId}/folders/${item.folder.id}`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['folders'],
            });
            queryClient.invalidateQueries({
                queryKey: ['projects', 'no-folder'],
            });
            toast({
                title: 'Success',
                description: 'Project added to folder',
                variant: 'success',
            });
            setAddProjectIsOpen(false);
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

    const {
        isPending: _noFolderPending,
        isError: _noFolderError,
        isSuccess: _noFolderSuccess,
        data: noFolderData,
    } = useQuery({
        queryKey: ['projects', 'no-folder'],
        queryFn: async () => {
            const response = await axiosInstance.get('/projects/no-folder');
            return response.data;
        },
    });

    const [addProjectIsOpen, setAddProjectIsOpen] = useState(false);

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div className="">
                        <Accordion type="multiple">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="dark:bg-black">
                                    <div className="flex mx-2 items-center">
                                        <FolderIcon className="mr-2 h-4 w-4" />
                                        {item.folder.name}
                                    </div>
                                </AccordionTrigger>

                                {item.projects.map((project: TProject) => (
                                    <AccordionContent key={project.id}>
                                        <ContextMenu>
                                            <ContextMenuTrigger>
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                >
                                                    <Link
                                                        to={`${baseRoutes.projects}/${project.id}`}
                                                    >
                                                        <FolderSymlink className="mr-2 h-4 w-4" />
                                                        {project.name}
                                                    </Link>
                                                </Button>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="w-fit">
                                                <ContextMenuItem
                                                    onClick={() => {
                                                        removeProjectFromFolderMutation.mutate(
                                                            project.id
                                                        );
                                                    }}
                                                >
                                                    <FolderSymlink className="h-4 w-4 mr-2" />
                                                    Remove from Folder
                                                </ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    </AccordionContent>
                                ))}
                            </AccordionItem>
                        </Accordion>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                    <ContextMenuItem
                        onClick={() => {
                            setAddProjectIsOpen(true);
                        }}
                    >
                        <FilePlus className="h-4 w-4 mr-2" />
                        Add new Project
                    </ContextMenuItem>

                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() => {
                            setEdit(true);
                        }}
                    >
                        <FolderSymlink className="h-4 w-4 mr-2" />
                        Edit Folder
                    </ContextMenuItem>

                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() => {
                            deleteFolderMutation.mutate();
                        }}
                    >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Folder
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <Dialog open={addProjectIsOpen} onOpenChange={setAddProjectIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="underline">
                            Add a project to this folder - {item.folder.name}
                        </DialogTitle>
                        <DialogDescription>
                            Organize your projects by adding them folders
                        </DialogDescription>
                    </DialogHeader>
                    {noFolderData?.projects.length > 0 ? (
                        noFolderData?.projects.map((project: TProject) => (
                            <div key={project.id}>
                                <Button
                                    onClick={() =>
                                        addProjectToFolderMutation.mutate(
                                            project.id
                                        )
                                    }
                                >
                                    {project.name}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div>No projects available to add</div>
                    )}
                    {/* <Form
         
     >
                 <form
                     className="grid gap-4 py-4"
                     // onSubmit={addTeamForm.handleSubmit(
                     //     addTeamOnSubmit
                     // )}
                 >
                     <FormField
                         // control={addTeamForm.control}
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
                   
                 </form>
             </Form> */}
                </DialogContent>
            </Dialog>
        </>
    );
};

const FolderEdit = ({ item, setEdit }: FolderComponentProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const editFolderForm = useForm<TFoldersSchema>({
        resolver: zodResolver(folderSchema),
        defaultValues: {
            name: item.folder.name,
        },
        mode: 'onChange',
    });

    const {
        formState: {
            isDirty: editFolderIsDirty,
            isValid: editFolderIsValid,
            isSubmitting: editFolderIsSubmitting,
        },
    } = editFolderForm;

    const editFolderMutation = useMutation({
        mutationFn: async (data: TFoldersSchema) => {
            const response = await axiosInstance.put(
                `/projects/folders/${item.folder.id}`,
                data
            );
            return response.data;
        },
        onSuccess: (_data) => {
            setEdit(false);
            queryClient.invalidateQueries({
                queryKey: ['folders'],
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

    const handleEditFolder = (data: TFoldersSchema) => {
        editFolderMutation.mutate(data);
    };

    return (
        <div>
            <Form {...editFolderForm}>
                <form onSubmit={editFolderForm.handleSubmit(handleEditFolder)}>
                    <div>
                        <FormField
                            control={editFolderForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Add a new folder"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="py-2 flex items-center gap-x-2">
                            <Button
                                variant="default"
                                disabled={
                                    !editFolderIsDirty ||
                                    !editFolderIsValid ||
                                    editFolderIsSubmitting
                                }
                                isLoading={editFolderIsSubmitting}
                                size={'sm'}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setEdit(false)}
                                size={'sm'}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};
