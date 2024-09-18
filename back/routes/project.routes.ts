import { Router } from 'express';
import {
    createProject,
    deleteProject,
    getProject,
    getProjects,
    updateProject,
    createFolder,
    getFolders,
    updateFolder,
    deleteFolder,
    getNoFolder,
    addProjectToFolder,
    removeProjectFromFolder,
    getFavorites,
    addToFvorites,
    removeFromFavorites,
    getRecentProjects,
    addToRecentProjects,
    saveClip,
    updateProjectStatus,
    getProjectStatus,
} from '~/controllers/project.controller';
import multer, { memoryStorage } from 'multer';
import localServiceProtect from '~/middleware/localService';
const storage = memoryStorage();
const upload = multer({ storage });

const router = Router();
router.get('/folders', getFolders);
router.post('/folders', createFolder);
router.put('/folders/:id', updateFolder);
router.delete('/folders/:id', deleteFolder);
router.get('/no-folder', getNoFolder);

router.get('/favorites', getFavorites);
router.post('/:projectId/favorite', addToFvorites);
router.delete('/:projectId/favorite', removeFromFavorites);

router.get('/recent', getRecentProjects);
router.post('/:id/recent', addToRecentProjects);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', upload.single('thumbnail'), updateProject);
router.delete('/:id', deleteProject);

router.post('/:projectId/folders/:folderId', addProjectToFolder);
router.delete('/:projectId/folders/:folderId', removeProjectFromFolder);

// microservice routes
router.post('/:projectId/save-clip', localServiceProtect, saveClip);
router.post('/:projectId/status', localServiceProtect, updateProjectStatus); // for some reason patch is not working
router.get('/:projectId/status', localServiceProtect, getProjectStatus);

export default router;
