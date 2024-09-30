import { create } from 'zustand';
import { TAuthType } from '#/types/user';

type GithubStore = {
    authType: TAuthType;
    setAuthType: (authType: TAuthType) => void;
};

export const useGithubStore = create<GithubStore>((set) => ({
    authType: 'signup',
    setAuthType: (authType: TAuthType) => set({ authType }),
}));
