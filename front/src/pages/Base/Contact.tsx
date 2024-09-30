import { Input } from '@/components/ui/input';
import { TextareBaseClassName } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    contactSchema,
    generateDefaultValuesFromSchema,
    TContactSchema,
} from '#/types/schemas';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from '@/components/ui/form';
import axiosInstance from '@/constants/axios';
import TextareaAutosize from 'react-textarea-autosize';
import setTitle from '@/components/hooks/set-title';
import api from '@/constants/api';
import { useUserStore } from '@/stores/user.store';
import { MAX_CONTACT_MESSAGE_LENGTH } from '#/shared/constants';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {  useToast } from '@/components/hooks/use-toast';

const Contact = () => {
    setTitle('Contact Us');
    const user = useUserStore(state => state.user);
    const form = useForm<TContactSchema>({
        resolver: zodResolver(contactSchema),
        defaultValues: generateDefaultValuesFromSchema(contactSchema),
    });

    const { toast } = useToast();

    useEffect(() => {
        if (user) { 
            form.setValue('name', user.fname);
            form.setValue('email', user.email);
        }
    }, [user, form]);


    const contactMutation = useMutation({
        mutationFn: (data: TContactSchema) => axiosInstance.post(api.aux.contact, data),
        onSuccess: () => {
            form.setValue('message', '');
            toast({ 
                description: 'Message sent successfully',
                variant: 'success'
            })
        },
        onError: (error: Error) => {
            toast({ 
                description: error.message,
                variant: 'destructive'
            })
        }   
    }
);
      
    const onSubmit = async (data: TContactSchema) => {
        contactMutation.mutate(data);
    };
    return (
        <div className="w-full max-w-2xl space-y-8 mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Contact Us</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Please fill in the form below to get in touch.
                </p>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={!!user?.isAuthenticated} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field}  disabled={!!user?.isAuthenticated}  />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                    <TextareaAutosize
                                        {...field}
                                        minRows={5}
                                        maxRows={8}
                                        maxLength={MAX_CONTACT_MESSAGE_LENGTH}
                                        placeholder="Enter your message"
                                        className={
                                            TextareBaseClassName +
                                            ' resize-none'
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );
};
export default Contact;
