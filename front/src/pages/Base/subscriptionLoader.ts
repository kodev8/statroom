import axiosInstance from '@/constants/axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { ISubscription } from '#/types/subscription';

const subscriptionLoader = async ({
    params,
}: LoaderFunctionArgs<ISubscription>) => {
    const { slug } = params;
    const response = await axiosInstance.get(`/api/plans/${slug}`);
    return response.data as ISubscription;
};

export default subscriptionLoader;