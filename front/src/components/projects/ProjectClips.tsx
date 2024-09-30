import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { VideoPlayer } from '@graphland/react-video-player';
import { videoProps } from '@/constants/videoProps';

import { Card, CardContent } from '@/components/ui/card';
import { TClip } from '#/types/project';
import { Button } from '@/components/ui/button';


type ProjectClipsProps = {
    clips: string[];
    selectedClip?: string;
    selectClip?: (clipId: string) => void;
};

export default function ProjectClips({ clips, selectClip, selectedClip }: Readonly<ProjectClipsProps>) {
    return (
        <>
            {clips?.length > 0 ? (
                <Carousel className="max-w-[400px]">
                    <CarouselContent>
                        {clips.map((clip) => {
                            const clipData = JSON.parse(clip) as TClip;
                            return (
                            <CarouselItem key={clipData.videoId}>
                                    <div className="flex flex-col items-center justify-center w-full h-full">
                                    {
                                            selectClip && (
                                                <Button
                                                    type="button"
                                                    variant={'outline'}
                                                    className='text-xs !p-1 mb-2 mx-auto'
                                                    onClick={() => selectClip(clipData.videoId)}
                                                >
                                                    Select
                                                </Button>

                                            )
                                        }
                                    <Card className={`flex items-center justify-center w-[400px] ${selectedClip === clipData.videoId ? 'border-2 border-green-300' : ''}`}>
                                        <CardContent className="flex aspect-square items-center justify-center p-2">
                                        <VideoPlayer
                                            {...videoProps}
                                            className={`aspect-square w-full rounded-md object-cover}`}
                                            height={380}
                                            width={380}
                                            sources={[{ src: clipData.src, type: clipData.contentType }]}
                                                />
                                               
                                            
                                              
                                        </CardContent>
                                        </Card>
                                       
                                </div>
                            </CarouselItem>
                        )})}
                    </CarouselContent>
                    <CarouselPrevious type="button" />
                    <CarouselNext type="button" />
                </Carousel>
            ) : (
                <div className="flex items-center justify-center h-96">
                    <p>Upload your match clips to get started!</p>
                </div>
            )}
        </>
    );
}
