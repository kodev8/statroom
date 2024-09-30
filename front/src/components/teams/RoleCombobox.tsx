'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { useToast } from '@/components/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    TUserProjectRolesSchema,
    userProjectRolesSchema,
} from '#/types/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { AxiosError } from 'axios';
import { useRef } from 'react';

const roles = [
    {
        label: 'Viewer',
        value: 'viewer',
        desc: 'Can view and comment on project',
    },
    {
        label: 'Editor',
        value: 'editor',
        desc: 'Can view, comment and edit project',
    },
] as const;

type RoleComboboxProps = {
    activeTeamId: string;
    member: TUserProjectRolesSchema;
};
function ComboboxForm({ activeTeamId, member }: RoleComboboxProps) {
    const formRef = useRef<HTMLFormElement>(null);

    const form = useForm<TUserProjectRolesSchema>({
        resolver: zodResolver(userProjectRolesSchema),
        defaultValues: {
            role: member.role,
            email: member.email,
        },
    });
    const queryClient = useQueryClient();

    const { toast } = useToast();

    const updateUserRoleMutation = useMutation({
        mutationFn: async (data: TUserProjectRolesSchema) => {
            const response = await axiosInstance.patch(
                `/teams/${activeTeamId}/members`,
                data
            );
            return response.data;
        },
        onSuccess: () => {
            // updateUserRoleForm.reset();
            queryClient.invalidateQueries({
                queryKey: ['activeTeam', activeTeamId],
            });
            toast({
                title: 'Success',
                description: 'User role updated successfully',
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

    const onSubmit = (data: TUserProjectRolesSchema) => {
        updateUserRoleMutation.mutate(data);
    };

    const removeMemberMutation = useMutation({
        mutationFn: async () => {
            await axiosInstance.delete(
                `/teams/${activeTeamId}/members?email=${member.email}`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['activeTeam', activeTeamId],
            });
            toast({
                title: 'Success',
                description: 'User removed successfully',
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
        <Form {...form}>
            <form
                ref={formRef}
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-fit justify-between',
                                                !field.value &&
                                                    'text-muted-foreground'
                                            )}
                                        >
                                            {field.value
                                                ? roles.find(
                                                      (role) =>
                                                          role.value ===
                                                          field.value
                                                  )?.label
                                                : 'Select Role'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search role..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                No Role
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {roles.map((role) => (
                                                    <CommandItem
                                                        value={role.label}
                                                        key={role.value}
                                                        onSelect={() => {
                                                            form.setValue(
                                                                'role',
                                                                role.value
                                                            );
                                                            console.log(
                                                                'role.value',
                                                                role.value
                                                            );
                                                            formRef.current?.dispatchEvent(
                                                                new Event(
                                                                    'submit',
                                                                    {
                                                                        cancelable:
                                                                            true,
                                                                        bubbles:
                                                                            true,
                                                                    }
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-4 h-6 w-6',
                                                                role.value ===
                                                                    field.value
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <p>{role.label}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {role.desc}
                                                            </p>
                                                            <FormMessage />
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>

                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() =>
                                                removeMemberMutation.mutate()
                                            }
                                        >
                                            Remove From Team
                                        </Button>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}

export default ComboboxForm;
