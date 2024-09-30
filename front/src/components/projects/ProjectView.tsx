import {
    Bird,
    CornerDownLeft,
    Paperclip,
    PencilIcon,
    Rabbit,
    Settings,
    Share,
    Turtle,
    XIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { VideoPlayer } from '@graphland/react-video-player';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import TextareaAutosize from 'react-textarea-autosize';
import { Progress } from '@/components/ui/progress';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SocketContext } from '@/constants/socket';
import { useToast } from '@/components/hooks/use-toast';
import { useProject } from '../hooks/useProject';
import { useUserStore } from '@/stores/user.store';
import { useForm } from 'react-hook-form';
import {
    AIRequestSchema,
    generateDefaultValuesFromSchema,
    TAIRequestSchema,
} from '#/types/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactLoading from 'react-loading';
import { axiosAIinstance } from '@/constants/axios';
import ChatBubble from '../ChatBubble';
import ProjectClips from './ProjectClips';
import { Status } from '#/types/project';
import { videoProps } from '@/constants/videoProps';

const getVideoDuration = (file: File) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const media = new Audio(reader.result as string);
            media.onloadedmetadata = () => resolve(media.duration);
        };
        reader.readAsDataURL(file);
        reader.onerror = (event: ProgressEvent<FileReader>) => {
            reject(
                new Error(
                    'Failed to read file: ' +
                        (event.target as FileReader).error?.message ||
                        'Unknown error'
                )
            );
        };
    });

const scrollToBottom = (
        container: HTMLElement | null,
        smooth = false,
      ) => {
        if (container?.children.length) {
          const lastElement = container?.lastChild as HTMLElement
      
          lastElement?.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'end',
            inline: 'nearest',
          })
        }
      }

type TAIService = {
    name: string;
    description: string;
    icon: React.ReactNode;
    service: TAIRequestSchema['model'];
};

type TMessage = {
    id: string;
    sender: string;
    message: string;
};

const SERVICES: TAIService[] = [
    // {
    //     name: 'Pitch Detection',
    //     description: 'Detect the pitch of the ball.',
    //     icon: <Rabbit className="size-5" />,
    //     service: "pitch_detection",
    // },
    {
        name: 'Player Detection',
        description: 'Detect the players on the field.',
        icon: <Bird className="size-5" />,
        service: "player_detection",
    },
    {
        name: 'Ball Detection',
        description: 'Detect the ball on the field.',
        icon: <Turtle className="size-5" />,
        service: "ball_detection",
    },
    {
        name: 'Player Tracking',
        description: 'Track the players on the field.',
        icon: <Rabbit className="size-5" />,
        service: "player_tracking",
    },
    {
        name: 'Team Classification',
        description: 'Classify the teams on the field.',
        icon: <Bird className="size-5" />,
        service: "team_classification",
    },
    {
        name: 'Radar',
        description: 'All in one solution for all detections.',
        icon: <Turtle className="size-5" />,
        service: "radar",
    },
];



export default function Project() {
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();
    const { project, setMode, role } = useProject();
    const [projectStatus, setProjectStatus] = useState<Status>(project?.status ?? 'active');
    const [projectDataClips, setProjectDataClips] = useState<string[]>(project?.clips ?? []);
    const [selectedClip, setSelectedClip] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const user = useUserStore((state) => state.user);
    const [file, setFile] = useState<File | null | undefined>(undefined);
    const aiServiceForm = useForm<TAIRequestSchema>({
        resolver: zodResolver(AIRequestSchema),
        defaultValues: {
            ...generateDefaultValuesFromSchema(AIRequestSchema),
            file: undefined,
        },
    });

    const [messages, setMessages] = useState<TMessage[]>([]);

    const { 
        data: messageData,
        error: messageError,
        isLoading: messageLoading,
    } = useQuery({ 
        queryKey: ['messages', project?.id],
        queryFn: async () => {
            const response = await axiosAIinstance.get(`/ai/${project?.id}/messages`);
            return response.data;
        },
        enabled: !!project?.id,
        
    });

    useEffect(() => {
        if (messageData) {
            setMessages(messageData.messages);
        }
    }, [messageData]);

    const { socket } = useContext(SocketContext);

    const queryClient = useQueryClient();
    
    useEffect(() => {
        if (socket && project?.id) {
            socket.emit('join_room', {
                room: project?.id,
            });
        
            socket.on('progress', (data: { percentage: number }) => {
                console.log(data);
                setProgress(data.percentage);
            });

            socket.on("new_clip", (data: {
                    video_id: string,
                    url: string,
                    content_type: string,
             }) => {
                    queryClient.invalidateQueries({
                        queryKey: ['project', project.id],
                    });
                
                const { video_id, url, content_type } = data;
                    setProjectDataClips([...projectDataClips, JSON.stringify({
                        videoId: video_id,
                        src: url,
                        contentType: content_type, 
                    })]);
                    
            });

            socket.on('status', (data: { status: Status }) => {
                console.log(data);
                setProjectStatus(data.status);
            })

            socket.on("system_message_start", () => {
                setMessages([
                    { id: `system-${new Date().toISOString}`, sender: 'system', message: '' },
                    // { id: `user-${new Date().toISOString}`, sender: user?.email as string, message: aiServiceForm.getValues('prompt') as string},
                    ...messages]
                )

               
            })

             socket.on("system_message", (data: { token: string }) => {
                 // continuously update last system message at index 0
                 console.log(data)
                const firstMessage = messages[0]
                if (firstMessage?.sender === "system") {
                    firstMessage.message += data.token
                    setMessages([firstMessage, ...messages.slice(1)])

                }
            })

            socket.on("system_message_end", () => {
                socket.off("system_message");
            })
           
            socket.on("system_message_error", () => {
                if (messages[0]?.sender === "system") {
                    setMessages(messages.slice(2))
                }
                toast({
                    title: 'Error',
                    description: 'AI service failed',
                    variant: 'destructive',
                });
            })

        }

        return () => {
            console.log('tearing down socket');
            socket?.off('progress');
            socket?.off('status');
            socket?.off('system_message_start');
            socket?.off('system_message');
            socket?.off('system_message_end');
            socket?.emit('leave_room', {
                room: project?.id,
            });
        };
    }, [socket, project?.id, messages, aiServiceForm, toast, user?.email, projectDataClips, queryClient]);  

    const chatAreaRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        scrollToBottom(chatAreaRef?.current, false);
    }, [messages, chatAreaRef]);

    const { isSubmitting, isLoading } = aiServiceForm.formState;

    const isProcessing = useMemo(
        () => isLoading || isSubmitting || (progress > 0 && progress < 100) || projectStatus === 'processing',
        [isLoading, isSubmitting, progress, projectStatus]
    );

    const aiServiceMutation = useMutation({
        mutationFn: async (data: TAIRequestSchema) => {
            if (isProcessing) {
                toast({
                    title: 'Wait!',
                    description: 'Service is already running',
                    variant: 'default',
                });
                return;
            }
            const formData = new FormData();
            if (data.model) formData.append('model', data.model);
            if (data.prompt) formData.append('prompt', data.prompt);
            if (data.file?.video) formData.append('file', data.file.video);
            if (data.video_id) formData.append('video_id', data.video_id);

            if ((!data.model || !data.file?.video) && (!data.video_id && data.prompt)) {
                toast({
                    title: 'Error',
                    description: 'Select a video or upload a new one',
                    variant: 'destructive',
                });
                return;
            }
            
            if (data.prompt){
            setMessages([
                { id: `user-${new Date().toISOString}`, sender: user?.email as string, message: data.prompt as string},
                ...messages]
            )
            }
       
            const response = await axiosAIinstance.post(
                `/ai/predict/${project?.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            setProgress(100);

            if (data.url) {
                toast({
                    title: 'Success',
                    description: 'AI service completed successfully',
                    variant: 'success',
                });

            }
            aiServiceForm.reset();

            if (selectedClip) aiServiceForm.setValue('video_id', selectedClip);
            setFile(undefined);
            if(inputRef.current) inputRef.current.value = '';
            setTimeout(() => {
                setProgress(0);
            }, 3000);
        },
        onError: (error) => {
            setProgress(0);
            toast({
                title: 'Error',
                description:
                    error instanceof AxiosError
                        ? (error.response?.data.message ??
                          'Something went wrong')
                        : 'Something went wrong',
                variant: 'destructive',
            });

            if (messages[0]?.sender === user?.email) {
                setMessages(messages.slice(1))
            }
        },

   
    });

    const aiServiceOnSubmit = (data: TAIRequestSchema) => {
        aiServiceMutation.mutate(data);
    };

    const selectClip = (clipId: string) => {
        setSelectedClip(clipId);
        aiServiceForm.setValue('video_id', clipId);
    }

    return (
        <Form {...aiServiceForm}>
            <form
                className="h-full"
                onSubmit={aiServiceForm.handleSubmit(aiServiceOnSubmit)}
            >
                {/* <div className="flex h-full w-full"> */}

                
                <div className="flex flex-col w-full">
                    <header className="sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b bg-background px-4">
                        <div className='flex items-center gap-2'>
                            <img
                                src={project?.thumbnail ?? '/default-thumbnail.webp'}
                                alt={project?.name}
                                width={50}
                                height={50}
                                className='object-contain transition-all hover:scale-105 aspect-squar overflow-hidden'
                            />
                            
                        <div className="flex flex-col">
                            <h1 className="text-xl font-semibold">
                                {project?.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                by {project?.owner}
                            </p>
                            </div>
                            </div>

                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden ml-auto"
                                >
                                    <Settings className="size-4" />
                                    <span className="sr-only">
                                        Service Settings
                                    </span>
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="max-h-[80vh]">
                                <DrawerHeader>
                                    <DrawerTitle>Configuration</DrawerTitle>
                                    <DrawerDescription>
                                        Configure the settings for the service
                                        and messages.
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
                                <fieldset className="grid gap-6 rounded-lg border p-4 w-full">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Description
                            </legend>
                            <p>{project?.description}</p>
                        </fieldset>
         
                        {role !== 'viewer' && (

                        <>
                        <fieldset className="grid gap-6 rounded-lg border p-4 w-full">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Settings
                            </legend>
                            <div className="grid gap-3">
                                <FormField
                                    control={aiServiceForm.control}
                                    name={'model'}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor={'model'}>
                                                Detection Model
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger
                                                    className='p-6'
                                                    id="sport"
                                                    aria-label={
                                                        'Select a model'
                                                    }
                                                >
                                                    <SelectValue
                                                        placeholder={
                                                            'Select a model'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent className='p-2'>
                                                    {SERVICES.map(
                                                        (
                                                            service: TAIService
                                                        ) => (
                                                            <SelectItem
                                                                value={
                                                                    service.service as string
                                                                }
                                                                key={
                                                                    service.service
                                                                }
                                                            
                                                            >
                                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                                    {
                                                                        service.icon
                                                                    }
                                                                    <div className="grid gap-0.5 items-start text-left">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                service.name
                                                                            }
                                                                        </p>
                                                                        <p
                                                                            className="text-xs"
                                                                            data-description
                                                                        >
                                                                            {
                                                                                service.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </fieldset>
  
                            </>
                        )}
                                       {/* clips section */}
                            <fieldset className="grid gap-6 rounded-lg border p-4 overflow-hidden">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Clips
                            </legend>

                            <div className='place-self-center'>
                                <ProjectClips clips={projectDataClips} selectClip={selectClip} selectedClip={selectedClip} />
                            </div>
                            
                        </fieldset>
                                 
                                </div>
                            </DrawerContent>
                        </Drawer>

                        <div className="flex items-center gap-1.5 ml-auto">

                            {(project?.owner === user?.email ||
                                role === 'editor') && (
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className=" gap-1.5 text-sm"
                                    onClick={() => setMode('edit')}
                                >
                                    <PencilIcon className="size-3.5" />
                                    Edit
                                </Button>
                            )}

                            <Button
                                type={'button'}
                                variant="outline"
                                size="sm"
                                className=" gap-1.5 text-sm"
                                onClick={() => toast({
                                    title: 'Share',
                                    description: 'This feature is coming soon',
                                    variant: 'default',
                                })
                                }
                            >
                                <Share className="size-3.5" />
                                Share
                            </Button>
                        </div>
                    </header>
                </div>

                <main className=" relative grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 h-full">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center">
                            <ReactLoading
                                type="cylon"
                                color="#000"
                                height={20}
                                width={20}
                            />
                        </div>
                    )}

                    <div className="relative hidden flex-col items-start gap-8 md:flex">
                        <fieldset className="grid gap-6 rounded-lg border p-4 w-full">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Description
                            </legend>
                            <p>{project?.description}</p>
                        </fieldset>
         
                        {role !== 'viewer' && (

                        <>
                        <fieldset className="grid gap-6 rounded-lg border p-4 w-full">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Settings
                            </legend>
                            <div className="grid gap-3">
                                <FormField
                                    control={aiServiceForm.control}
                                    name={'model'}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor={'model'}>
                                                Detection Model
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger
                                                    className='p-6'
                                                    id="sport"
                                                    aria-label={
                                                        'Select a model'
                                                    }
                                                >
                                                    <SelectValue
                                                        placeholder={
                                                            'Select a model'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent className='p-2'>
                                                    {SERVICES.map(
                                                        (
                                                            service: TAIService
                                                        ) => (
                                                            <SelectItem
                                                                value={
                                                                    service.service as string
                                                                }
                                                                key={
                                                                    service.service
                                                                }
                                                            
                                                            >
                                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                                    {
                                                                        service.icon
                                                                    }
                                                                    <div className="grid gap-0.5 items-start text-left">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                service.name
                                                                            }
                                                                        </p>
                                                                        <p
                                                                            className="text-xs"
                                                                            data-description
                                                                        >
                                                                            {
                                                                                service.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </fieldset>
  
                            </>
                        )}
                                       {/* clips section */}
                            <fieldset className="grid gap-6 rounded-lg border p-4 w-full ">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Clips
                            </legend>

                            <div className='place-self-center'>
                                <ProjectClips clips={projectDataClips} selectClip={selectClip} selectedClip={selectedClip} />
                            </div>
                            
                        </fieldset>

                

                    </div>
                    <div className="relative flex  flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
                    <div className="flex items-center">
                        
                    {
                                selectedClip && (
                                    <>
                                            <p className='font-semibold text-xs'>Selected Clip: {selectedClip}</p>
                                            <Button 
                                                type="button"
                                            variant={'ghost'}
                                            className='ml-2'
                                            onClick={() => {
                                                setSelectedClip(undefined);
                                                aiServiceForm.setValue('video_id', undefined);
                                                }}
                                            >
                                                Clear
                                            </Button>
                                            </>
                                    )
                                }
                        <Badge
                            variant="outline"
                            className="ml-auto"
                        >
                            Output
                        </Badge>
                        </div>
                        <div
                            className="grid grid-rows-[auto_1fr] flex-1 mt-8 h-full max-h-[60vh] pb-4 overflow-auto"
                            id="playground-area"
                        >
                            <Progress value={progress} />
                            <ScrollArea
                                id="chat-area"
                                className="w-full h-full"
                            >
                                {messageLoading && (
                                    <div className="flex items-center justify-center h-full">
                                        <ReactLoading
                                            type="cylon"
                                            color="#000"
                                            height={20}
                                            width={20}
                                        />
                                    </div>
                                )}
                                {messageError && (
                                    <div className="flex items-center justify-center h-full">
                                        <p>Error loading messages</p>
                                    </div>
                                )}
                                {messages && (
                                    <div ref={chatAreaRef} className="w-full h-full">
                                        {
                                            [...messages].reverse().map((message: TMessage) => (
                                                <ChatBubble
                                                    key={message.id}
                                                    isUser={message.sender === user?.email}
                                                    message={message.message}
                                                    sender={message.sender}
                                                />
                                            )
                                            )}
                                    </div>
                                )}
                                
                            </ScrollArea>
                        </div>

                        {role !== 'viewer' && (

                        <div className="relative mt-auto overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
                            <FormField
                                control={aiServiceForm.control}
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">
                                            {' '}
                                            Message
                                        </FormLabel>
                                        <FormControl>
                                            <TextareaAutosize
                                                {...field}
                                                maxRows={5}
                                                id="message"
                                                disabled={isProcessing || isLoading || isSubmitting || progress > 0} 
                                                placeholder="Type your message here..."
                                                className="min-h-12 w-full resize-none p-3 shadow-none focus:outline-none focus:border-none disabled:hidden"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center p-3 pt-0">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 mt-auto">
                                                <FormField
                                                    control={
                                                        aiServiceForm.control
                                                    }
                                                    name="file"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Label>
                                                                    <>
                                                                        <Paperclip className="size-4" />
                                                                        <Input
                                                                            ref={inputRef}
                                                                            onChange={async (
                                                                                e
                                                                            ) => {
                                                                                const video =
                                                                                    e
                                                                                        .target
                                                                                        .files?.[0];
                                                                                if (
                                                                                    !video
                                                                                )
                                                                                    return;
                                                                                const v =
                                                                                    await getVideoDuration(
                                                                                        video
                                                                                    );
                                                                                field.onChange(
                                                                                    {
                                                                                        video,
                                                                                        duration:
                                                                                            v,
                                                                                    }
                                                                                );
                                                                                setFile(
                                                                                    e
                                                                                        .target
                                                                                        .files?.[0]
                                                                                );
                                                                            }}
                                                                            type="file"
                                                                            className="hidden"
                                                                            accept="video/*"
                                                                        />
                                                                      
                                                                    </>
                                                                    
                                                                </Label>
                                                                
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                        
                                                    )}
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            Attach File
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                    {file && (
                                        <>
                                    <VideoPlayer
                                        {...videoProps}
                                        height={160}
                                        width={280}
                                        className="rounded-lg m-4"
                                        sources={[
                                            {
                                                src: URL.createObjectURL(file),
                                                type: file.type,
                                            },
                                        ]}
                                        />
                                        
                                            <XIcon className="size-3.5 cursor-pointer" onClick={() => {
                                                aiServiceForm.setValue('file', undefined);
                                                setFile(undefined);
                                                if(inputRef.current) inputRef.current.value = '';
                                            }
                                            } />
                                            </>
                                )}

                                <Button
                                    type="submit"
                                    size="sm"
                                    className="ml-auto mt-auto gap-1.5"
                                    disabled={isProcessing || isLoading || isSubmitting || progress > 0}
                                    isLoading={isSubmitting}
                                >
                                    Send Message
                                    <CornerDownLeft className="size-3.5" />
                                </Button>
                            </div>
                            </div>
                        )}
                    </div>
                </main>
                {/* </div> */}
            </form>
        </Form>
    );
}
