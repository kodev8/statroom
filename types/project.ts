import { TEditProjectSchema, TProjectSchema } from "./schemas"

export type Status = 'active' | 'archived' | 'processing'

export type TClip = {
    src: string;
    contentType: string;
    videoId: string;
}

export type TFolder = {
    id: string;
    name: string;
};
    
export type TProject = TProjectSchema & Omit<TEditProjectSchema, 'latestTag'> & {
    id: string;
    createdAt: string; 
    updatedAt: string;
    owner: string;
    favorite: boolean;
    clips: string[];
}