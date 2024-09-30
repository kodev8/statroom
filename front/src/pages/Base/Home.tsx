import setTitle from '@/components/hooks/set-title';

export default function Home() {
    setTitle('Home');

    return (
        <section>
            <div className="flex flex-col items-center justify-center lg:flex-row">
                <div className="z relative rounded-md w-full">
                    <video
                        className="rounded-md w-full"
                        id="background-video"
                        loop
                        autoPlay
                        muted
                    >
                        <source src="/bg-vid-1.mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-8xl font-bold text-white">
                                StatRoom
                            </h1>
                            <p className="text-white text-2xl">
                                Your stats. Your rooms. Your way.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
