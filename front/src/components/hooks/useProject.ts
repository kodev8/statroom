import { useContext } from 'react';
import { ProjectContext } from '@/pages/Productivity/Projects/Project';

export const useProject = () => {
    return useContext(ProjectContext);
};
