import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { useUserStore } from '@/stores/user.store';
import ReactLoading from 'react-loading';
import { Frown } from 'lucide-react';
import { ActivityCard } from '@/components/ActivityCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TActivity } from '#/types/activity';

export function Activity() {
    const user = useUserStore((state) => state.user);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['activity', user?.email],
        queryFn: async () => {
            const response = await axiosInstance.get(`/activity`);
            return response.data;
            // fetch activity data
        },
    });

    let content;

    if (isLoading) {
        content = (
            <div className="flex justify-center items-center">
                <ReactLoading
                    type="cylon"
                    height={30}
                    width={30}
                    color="#000"
                />
            </div>
        );
    } else if (isError) {
        content = (
            <div className="flex flex-col gap-4 items-center justify-center ">
                <Frown className="h-24 w-24" />
                <p>Sorry! We were unable get your recent activity.</p>
            </div>
        );
    } else {
        if (data.length === 0) {
            content = (
                <div className="flex flex-col gap-4 items-center justify-center ">
                    <Frown className="h-24 w-24" />
                    <p>Sorry! You don't have any recent activity.</p>
                </div>
            );
        } else {
            content = (
                <ScrollArea className="w-full  rounded-md border h-96">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-y-8 gap-x-4  p-4">
                        {data?.map((activity: TActivity) => {
                            return (
                                <ActivityCard
                                    key={activity.id}
                                    item={activity}
                                />
                            );
                        })}
                    </div>
                </ScrollArea>
            );
        }
    }

    return (
        <div className="flex h-full  w-full justify-center">
            {content}
        </div>
    );
}
