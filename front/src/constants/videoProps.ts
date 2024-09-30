import { VideoPlayerProps } from '@graphland/react-video-player';

export const videoProps: VideoPlayerProps = {
    theme: 'forest', // 'city', 'fantasy', 'forest', 'sea'
    height: 320,
    width: 480,
    autoPlay: false,
    loop: false,
    // sources: videoSources,
    controlBar: {
        skipButtons: {
            forward: 5,
            backward: 5,
        },
    },
    playbackRates: [0.5, 1, 1.5, 2],
    disablePictureInPicture: false,
};