import { create } from 'zustand';
import { produce } from 'immer';
import { TAuthUser } from '#/types/user';
import { TNotificationSchema } from '#/types/schemas';

export type TUserStore = {
    user: TAuthUser | null;
    setUser: (data: TAuthUser | null) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
};

const initialState = {
    user: {
        id: -1,
        fname: '',
        lname: '',
        email: '',
        isAuthenticated: false,
        notifications: 'all' as TNotificationSchema['notifications'],
    },
};

export const useUserStore = create<TUserStore>((set) => ({
    ...initialState,
    setUser: (data: TAuthUser | null) =>
        set(
            produce((state) => {
                state.user = { ...state.user, ...data };
            })
        ),
    setAuthenticated: (isAuthenticated: boolean) =>
        set(
            produce((state) => {
                state.user.isAuthenticated = isAuthenticated;
            })
        ),
}));
