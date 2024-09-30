import { FlameIcon, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';

import { BrowseIcon } from '@/components/Icons';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';

import { Button } from '@/components/ui/button';

import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from '@/components/ui/form';

import { ScrollArea } from '@/components/ui/scroll-area';

import ReactLoading from 'react-loading';

import { cn } from '@/lib/utils';

import { folderSchema, TFoldersSchema } from '#/types/schemas';
import { TProject, TFolder } from '#/types/project';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useToast } from '@/components/hooks/use-toast';
import axiosInstance from '@/constants/axios';
import { AxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Folder } from '@/pages/Productivity/Dashboard/Folder';
import { zodResolver } from '@hookform/resolvers/zod';

type SidebarProps = {
    className?: string;
};

export function Sidebar({ className }: Readonly<SidebarProps>) {
    const [addFolderIsOpen, setAddFolderIsOpen] = useState(false);
    const { toast } = useToast();

    const addFolderForm = useForm<TFoldersSchema>({
        resolver: zodResolver(folderSchema),
        defaultValues: {
            name: 'New Folder',
        },
        mode: 'onBlur',
    });
    const queryClient = useQueryClient();

    const {
        formState: {
            // isDirty: addFolderIsDirty
            isValid: addFolderIsValid,
            isSubmitting: addFolderIsSubmitting,
        },
    } = addFolderForm;

    const {
        data: foldersData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['folders'],
        queryFn: async () => {
            const response = await axiosInstance.get('/projects/folders');
            return response.data;
        },
    });

    const addFolderMutation = useMutation({
        mutationFn: async (data: TFoldersSchema) => {
            const response = await axiosInstance.post(
                '/projects/folders',
                data
            );
            return response.data;
        },
        onSuccess: (_data) => {
            addFolderForm.reset();
            setAddFolderIsOpen(false);
            queryClient.invalidateQueries({
                queryKey: ['folders'],
            });
            toast({
                title: 'Success',
                description: 'Folder added successfully',
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

    const handleAddFolder = (data: TFoldersSchema) => {
        addFolderMutation.mutate(data);
    };

    let content;

    if (isError) {
        content = (
            <div className="text-sm text-muted-foreground flex items-center justify-center text-center">
                <p>Something went wrong while getting your folders</p>
            </div>
        );
    } else if (isLoading) {
        content = (
            <div className="flex h-full justify-center items-center">
                <ReactLoading
                    type="bubbles"
                    color="#000"
                    height={20}
                    width={20}
                />
            </div>
        );
    } else {
        content = (
            <>
                <div className="flex items-center justify-between">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Folders
                    </h2>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() =>
                                        setAddFolderIsOpen(!addFolderIsOpen)
                                    }
                                    variant="secondary"
                                    size="icon"
                                    className="h-4 w-4"
                                >
                                    {addFolderIsOpen ? (
                                        <MinusCircleIcon className="h-4 w-4" />
                                    ) : (
                                        <PlusCircleIcon className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {addFolderIsOpen ? 'Close' : 'Add'} New Folder
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="space-y-1">
                    {addFolderIsOpen && (
                        <div className="">
                            <Form {...addFolderForm}>
                                <form
                                    className="px-2 flex items-center gap-x-4"
                                    onSubmit={addFolderForm.handleSubmit(
                                        handleAddFolder
                                    )}
                                >
                                    <FormField
                                        control={addFolderForm.control}
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
                                    <Button
                                        variant="secondary"
                                        disabled={
                                            !addFolderIsValid ||
                                            addFolderIsSubmitting
                                        }
                                        isLoading={addFolderIsSubmitting}
                                        size={'sm'}
                                    >
                                        Add
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    )}

                    {foldersData?.folders?.map(
                        (item: { folder: TFolder; projects: TProject[] }) => (
                            <Folder key={item.folder.id} item={item} />
                        )
                    )}
                </div>
            </>
        );
    }

    return (
        <div className={cn('pb-12', className)}>
            <ScrollArea className="space-y-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Discover
                    </h2>
                    <div className="space-y-1">
                        <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => {
                                toast({
                                    title: 'Coming Soon',
                                    description: 'Trending feature coming soon',
                                });
                            }}
                        >
                            <FlameIcon className="mr-2 h-4 w-4" />
                            Trending
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => {
                                toast({
                                    title: 'Coming Soon',
                                    description: 'Browse feature coming soon',
                                });
                            }}
                        >
                            <BrowseIcon className="mr-2 h-4 w-4" />
                            Browse
                        </Button>
                    </div>
                </div>

                <div className="px-3 py-2">{content}</div>
            </ScrollArea>
        </div>
    );
}
