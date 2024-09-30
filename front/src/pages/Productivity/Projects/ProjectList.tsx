import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import setTitle from '@/components/hooks/set-title';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    categories,
    generateDefaultValuesFromSchema,
    leagues,
    projectSchema,
    TProjectSchema,
} from '#/types/schemas';
import { toTitleCase } from '@/lib/utils';
import { AxiosError } from 'axios';
import { useToast } from '@/components/hooks/use-toast';
import axiosInstance from '@/constants/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import ProjectTable from '@/components/projects/ProjectTable';
import ProjectSelect from '@/components/projects/ProjectSelect';

export default function ProjectList() {
    setTitle('Projects');

    const [tab, setTab] = useState('all');

    const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleTabChange = (tab: string) => {
        setTab(tab);
    };

    // refetch when page or tab changes

    const { data: availableTeams } = useQuery({
        queryKey: ['teams', 'available'],
        queryFn: async () => {
            const response = await axiosInstance.get('/teams?available=true');
            return response.data;
        },
    });

    const addProjectForm = useForm<TProjectSchema>({
        resolver: zodResolver(projectSchema),
        defaultValues: generateDefaultValuesFromSchema(projectSchema),
    });

    const {
        formState: {
            isSubmitting: addProjectIsSubmitting,
            isDirty: addProjectIsDirty,
            isValid: addProjectIsValid,
        },
    } = addProjectForm;

    const addProjectMutation = useMutation({
        mutationFn: async (data: TProjectSchema) => {
            const response = await axiosInstance.post('/projects', data);
            return response.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setAddProjectDialogOpen(false);
            addProjectForm.reset();
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Project created successfully',
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

    const addProjectOnSubmit = async (data: TProjectSchema) => {
        addProjectMutation.mutate(data);
    };

    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs
                value={tab}
                onValueChange={handleTabChange}
                defaultValue={tab}
            >
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="all" className="dark:bg-black">
                            All
                        </TabsTrigger>
                        <TabsTrigger value="active" className="dark:bg-black">
                            Active
                        </TabsTrigger>
                        <TabsTrigger
                            value="processing"
                            className="dark:bg-black"
                        >
                            Processing
                        </TabsTrigger>
                        <TabsTrigger value="archived" className="dark:bg-black">
                            Archived
                        </TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2">
                        <Dialog
                            open={addProjectDialogOpen}
                            onOpenChange={setAddProjectDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-7 gap-1">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Add Project
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="underline">
                                        Create a new Project
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add your new project to your workspace.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...addProjectForm}>
                                    <form
                                        className="grid gap-3"
                                        onSubmit={addProjectForm.handleSubmit(
                                            addProjectOnSubmit
                                        )}
                                    >
                                        <FormField
                                            control={addProjectForm.control}
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
                                            control={addProjectForm.control}
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

                                        <div className="grid gap-3">
                                            <ProjectSelect
                                                form={addProjectForm}
                                                label="Sport"
                                                name="sport"
                                                placeholder="Select sport"
                                                items={[
                                                    {
                                                        label: 'Football',
                                                        value: 'football',
                                                    },
                                                ]}
                                            />
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2">
                                            <ProjectSelect
                                                form={addProjectForm}
                                                label="League"
                                                name="league"
                                                placeholder="Select league"
                                                items={leagues.map((league) => ({
                                                    label: toTitleCase(league),
                                                    value: league,
                                                }))
                                                }
                                                withDeselect
                                            />

                                            <ProjectSelect
                                                form={addProjectForm}
                                                label="Category"
                                                name="category"
                                                placeholder="Select category"
                                                items={categories.map((category) => ({
                                                        label: toTitleCase(category),
                                                        value: category,
                                                    })
                                                )
                                                }
                                                withDeselect
                                            />
                                        </div>

                                        <FormField
                                            control={addProjectForm.control}
                                            name="tags"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel htmlFor="tags">
                                                        Tags
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Separate tags with
                                                        commas
                                                    </FormDescription>
                                                    <Input {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid gap-1">
                                            <FormField
                                                control={addProjectForm.control}
                                                name="team"
                                                render={({ field: _field }) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="team">
                                                            Project team
                                                        </FormLabel>
                                                        <FormDescription className="grid">
                                                            <span>
                                                                If no team is
                                                                selected, the
                                                                project will be
                                                                assigned to you.
                                                            </span>
                                                            <span className=" font-bold text-red-700 underline">
                                                                You cannot
                                                                change the Team
                                                                once the project
                                                                is created
                                                            </span>
                                                        </FormDescription>
                                                        <ProjectSelect
                                                            form={
                                                                addProjectForm
                                                            }
                                                            label="Team"
                                                            name="team"
                                                            placeholder="Assign this project to a team"
                                                            items={availableTeams?.teams?.map(
                                                                (team: {
                                                                    id: number;
                                                                    name: string;
                                                                }) => ({
                                                                    label: team.name,
                                                                    value: `${team.id}`,
                                                                })
                                                            )}
                                                            withDeselect
                                                        />
                                                        {/* <Select
                                                            key={teamKey}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                id="team"
                                                                aria-label="Assign this project to a team"
                                                            >
                                                                <SelectValue placeholder="Assign this project to a team" />
                                                            </SelectTrigger>
                                                            <SelectContent
                                                                enableDeselect
                                                                onClickDeselect={() => {
                                                                    addProjectForm.setValue(
                                                                        'team',
                                                                        undefined
                                                                    );
                                                                    setTeamKey(
                                                                        +new Date()
                                                                    );
                                                                }}
                                                            >
                                                                {availableTeams?.teams?.map(
                                                                    (team: {
                                                                        id: number;
                                                                        name: string;
                                                                    }) => (
                                                                        <SelectItem
                                                                            key={
                                                                                team.id
                                                                            }
                                                                            value={`${team.id}`}
                                                                        >
                                                                            {
                                                                                team.name
                                                                            }{' '}
                                                                            -{' '}
                                                                            <span className="text-xs text-muted-foreground">
                                                                                
                                                                                {
                                                                                    team.id
                                                                                }
                                                                            </span>
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select> */}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !addProjectIsDirty ||
                                                    !addProjectIsValid
                                                }
                                                isLoading={
                                                    addProjectIsSubmitting
                                                }
                                            >
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <TabsContent value="all">
                    <ProjectTable tab={tab} />
                </TabsContent>
                <TabsContent value="active">
                    <ProjectTable tab={tab} />
                </TabsContent>
                <TabsContent value="processing">
                    <ProjectTable tab={tab} />
                </TabsContent>
                <TabsContent value="archived">
                    <ProjectTable tab={tab} />
                </TabsContent>
            </Tabs>
        </main>
    );
}
