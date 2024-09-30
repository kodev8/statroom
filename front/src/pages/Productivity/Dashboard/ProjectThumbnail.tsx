import { cn } from '@/lib/utils';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { FolderSymlink, Share, StarOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from '@/components/hooks/use-toast';
import { TProject } from '#/types/project';
import { Link } from 'react-router-dom';
import axiosInstance from '@/constants/axios';
interface ProjectThumbnailProps extends React.HTMLAttributes<HTMLDivElement> {
    project: TProject;
    aspectRatio?: 'portrait' | 'square';
    width?: number;
    height?: number;
}

export function ProjectThumbnail({
    project,
    aspectRatio = 'portrait',
    width,
    height,
    className,
    ...props
}: ProjectThumbnailProps) {
    const queryClient = useQueryClient();

    const removeFromFavoritesMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete(
                `/projects/${project.id}/favorite`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Project added to favorites',
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
        <div className={cn('h-full', className)} {...props}>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div className={cn("flex items-center justify-center h-full overflow-hidden rounded-md border",
                        {
                            'border-gray-200 p-3': aspectRatio === 'portrait',
                            'border-transparent': aspectRatio === 'square',
                        }
                    )}>
                        <img
                            src={project.thumbnail ?? '/default-thumbnail.webp'}
                            alt={project.name}
                            width={width}
                            height={height}
                            className={cn(
                                'h-full transition-all hover:scale-105 object-contain',
                                {
                                    'aspect-[3/4]': aspectRatio === 'portrait',
                                    'aspect-square': aspectRatio === 'square',
                                }
                            )}
                        />
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                    <ContextMenuItem>
                        <FolderSymlink className="h-4 w-4 mr-2" />
                        Add to Folder
                    </ContextMenuItem>

                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() => {
                            removeFromFavoritesMutation.mutate();
                        }}
                    >
                        <StarOff className="h-4 w-4 mr-2" />
                        Unfavourite
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${window.location.origin}/dashboard/projects/${project.id}`
                            );
                            toast({
                                title: 'Share link copied to clipboard',
                                variant: 'success',
                            });
                        }
                        }
                    >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <div className="space-y-1 text-sm mt-4">
                <Link to={`/dashboard/projects/${project.id}`}>
                    <h3 className="font-medium leading-none">{project.name}</h3>
                </Link>
                <p className="text-xs text-muted-foreground">{project.owner}</p>
            </div>
        </div>
    );
}
