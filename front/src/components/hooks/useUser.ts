import { useEffect, useState } from 'react';
import { useUserStore, TUserStore } from '@/stores/user.store';
import axiosInstance from '@/constants/axios';
import api from '@/constants/api';

export const useUser = () => {
    const user = useUserStore((state: TUserStore) => state.user);
    const setUser = useUserStore((state: TUserStore) => state.setUser);

    const [isLoading, setIsLoading] = useState(!user || !user.isAuthenticated);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const response = await axiosInstance.get(api.auth.me);
            if (response.status === 200) {
                const userData = response.data.user;
                setUser({ ...userData, isAuthenticated: true });
            } else {
                setError(true);
            }
        };
        if (!user || !user.isAuthenticated) {
            fetchUser()
                .catch((err) => {
                    console.error(err);
                    setError(true);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [user, setUser]);

    return { user, isLoading, error };
};
