import { Request, Response } from 'express';
import statusCodes from '~/constants/statusCodes';
import { getDriver } from '~/database/neo4j_setup';
import {
    projectSchema,
    editProjectSchema,
    folderSchema,
} from '#/types/schemas';
import { TProject, Status } from '#/types/project';
import { int } from 'neo4j-driver';
import { PROJECT_PAGE_SIZE } from '#/shared/constants';
import {
    deleteImagesInPath,
    firebaseUpload,
    validateFiles,
} from '~/utils/firebase.utils';
import { getBucket } from '~/database/firebase_setup';
import { redisClient } from '~/database/redis_setup';
import { parseZodBody } from '~/utils/zod.utils';
import logger from '~/middleware/winston';

export const getProjects = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { page, limit, status, tags, name } = req.query;
        const resolvePage = parseInt(page as string, 10) ?? 1;
        let nlimit = limit ?? `${PROJECT_PAGE_SIZE}`;
        const resolveLimit =
            parseInt(nlimit as string, 10) ?? PROJECT_PAGE_SIZE;
        const skip = (resolvePage - 1) * resolveLimit;
        let options: Record<any, any> = { email: req.user?.email };
        let filterClause1 = '';
        let filterClause2 = '';
        if (status) {
            if (
                !Object.values(
                    editProjectSchema.shape.status._def.innerType.Values
                ).includes(status as Status)
            ) {
                return res
                    .status(statusCodes.badRequest)
                    .json({ message: 'Invalid status' });
            }
            filterClause1 += `WHERE p.status = "${status as string}" `;
            filterClause2 += `WHERE tp.status = "${status as string}" `;
            options = { ...options, status };
        }

        let tagsArray: string[] = [];
        if (tags) {
            tagsArray = (tags as string).split(',');
            tagsArray = tagsArray.map((tag) => tag.trim());
            if (filterClause1) {
                filterClause1 += ' AND ';
                filterClause2 += ' AND ';
            } else {
                filterClause1 += 'WHERE ';
                filterClause2 += 'WHERE ';
            }
            filterClause1 += ` any(tag in p.tags WHERE tag in $tagsArray)`;
            filterClause2 += ` any(tag in tp.tags WHERE tag in $tagsArray)`;
            options = { ...options, tagsArray };
        }

        let nameClause1 = '';
        let nameClause2 = '';
        if (name) {
            if (filterClause1 || filterClause2) {
                nameClause1 += 'AND ';
                nameClause2 += 'AND ';
            } else {
                nameClause1 += 'WHERE ';
                nameClause2 += 'WHERE ';
            }

            nameClause1 += 'toLower(p.name) CONTAINS toLower($name) ';
            nameClause2 += 'toLower(tp.name) CONTAINS toLower($name) ';
            options = { ...options, name };
        }

        options = { ...options, skip: int(skip), limit: int(resolveLimit) };
        const neo4jsession = getDriver()?.session();

        const result = await neo4jsession?.run(
            `CALL {
            MATCH (u:User {email: $email})-[:HAS_PROJECT {type: 'private'}]->(p:Project)
            ${filterClause1}
            ${nameClause1}
            OPTIONAL MATCH (u)-[:FAVORITE]->(p)
            RETURN p AS project, u AS projectOwner, p.createdAt AS createdAt, 
                CASE WHEN (u)-[:FAVORITE]->(p) THEN true ELSE false END AS isFavorite
            UNION
            MATCH (u:User {email: $email})-[:MEMBER_OF]->(t:Team)-[:HAS_PROJECT]->(tp:Project)
            WITH t, tp
            MATCH (o:User)-[:MEMBER_OF {role: 'owner'}]->(t)
            ${filterClause2}
            ${nameClause2}
            OPTIONAL MATCH (u)-[:FAVORITE]->(tp)
            RETURN tp AS project, o AS projectOwner, tp.createdAt AS createdAt,
            CASE WHEN (u)-[:FAVORITE]->(tp) THEN true ELSE false END AS isFavorite
            }
            WITH COLLECT({project: project, projectOwner: projectOwner, createdAt: createdAt, isFavorite: isFavorite}) AS allRows
            WITH allRows, SIZE(allRows) AS totalRows
            UNWIND allRows AS row
            WITH row.project AS project, row.projectOwner AS projectOwner, row.createdAt AS createdAt, 
                row.isFavorite AS isFavorite, totalRows
            ORDER BY createdAt DESC
            SKIP $skip LIMIT $limit
            RETURN project, projectOwner, totalRows, isFavorite
            `,
            options
        );

        const projects: TProject[] = result?.records.map((record) => {
            return {
                ...record.get('project')?.properties,
                id: record.get('project')?.identity,
                owner: record.get('projectOwner')?.properties?.email,
                favorite: record.get('isFavorite'),
            };
        });

        const totalRows = result?.records[0]?.get('totalRows');
        const maxPage = Math.ceil(totalRows / resolveLimit);

        return res.status(statusCodes.success).json({
            projects,
            totalProjects: totalRows,
            maxPage: maxPage,
        });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while getting projects' });
    }
};

export const getProject = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        const result = await neo4jsession?.run(
            `MATCH (p:Project) MATCH (p)<-[:HAS_PROJECT]-(t:Team)<-[rel:MEMBER_OF]-(u:User {email: $email})
            MATCH (owner:User)-[:MEMBER_OF {role: 'owner'}]->(t)
            WHERE ID(p) = toInteger($id)
            RETURN p, owner, rel
            UNION
            MATCH (p)<-[:HAS_PROJECT {type: 'private'}]-(owner:User)
            WHERE ID(p) = toInteger($id)
            RETURN p, owner, null as rel`,
            { id: req.params.id, email: req.user?.email }
        );
        const projectRecord = result?.records.map((record) => ({
            ...record.get('p').properties,
            id: record.get('p').identity,
            owner: record.get('owner')?.properties?.email,
        }));

        if (projectRecord.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Project not found' });
        }

        const project = projectRecord[0];
        const role = result?.records[0].get('rel')?.properties?.role;

        return res.status(statusCodes.success).json({
            project,
            role,
        });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while getting project' });
    }
};

export const createProject = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(projectSchema, req, res);
        if (!result.success) {
            return result.response;
        }

        const neo4jsession = getDriver()?.session();
        const project = {
            ...result.data,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // check if a project with the same name exists even by case
        const projectNameCheck = await neo4jsession?.run(
            `MATCH (p:Project)
            WHERE toLower(p.name) = toLower($name)
            RETURN p`,
            { name: project.name }
        );

        if (projectNameCheck?.records.length > 0) {
            return res
                .status(statusCodes.badRequest)
                .json({ message: 'Project name is not avaialable' });
        }

        // if there is a team, make sure the teams exists and LEADS the team
        let projectResult;
        if (project.team) {
            projectResult = await neo4jsession?.run(
                `MATCH (u:User {email: $email})-[:MEMBER_OF {role: 'owner'}]->(t:Team)
                 WHERE ID(t) = toInteger($teamId)
                 CREATE (p:Project $project)<-[:HAS_PROJECT]-(t)
                 CREATE (u)-[:HAS_PROJECT {type: 'private'}]->(p)
                 RETURN p`,
                { email: req.user?.email, teamId: project.team, project }
            );

            if (projectResult?.records.length === 0) {
                return res.status(statusCodes.notFound).json({
                    message:
                        'Could not add project as we could not assign it to a team',
                });
            }
        } else {
            projectResult = await neo4jsession?.run(
                `MATCH (u:User {email: $email})
             CREATE (p:Project $project)<-[:HAS_PROJECT {type: 'private'}]-(u)
             RETURN p`,
                { email: req.user?.email, project }
            );
        }

        // TOD: check project count for owner's subscription

        const projectRecord = projectResult?.records.map(
            (record) => record.get('p').properties
        );

        return res
            .status(statusCodes.success)
            .json({ project: projectRecord[0].name });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while creating project' });
    }
};

export const updateProject = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        if (req.body.tags) req.body.tags = JSON.parse(req.body.tags);

        const result = parseZodBody(editProjectSchema, req, res);
        if (!result.success) {
            return result.response;
        }

        let project = {
            ...result.data,
            updatedAt: new Date().toISOString(),
        };

        if (req.file) {
            await validateFiles({ file: [req.file] });

            deleteImagesInPath(
                getBucket(),
                `projects/${req.params.id}/thumbnail`
            );
            let { media } = await firebaseUpload(
                req.file,
                `projects/${req.params.id}/thumbnail`
            );

            project.thumbnail = media;
        }

        const neo4jsession = getDriver()?.session();
        const projectResult = await neo4jsession?.run(
            `MATCH (u:User {email: $email})
            OPTIONAL MATCH (u)-[:HAS_PROJECT]->(directProject:Project)
            OPTIONAL MATCH (u)-[:MEMBER_OF {role: 'editor'}]->(t:Team)-[:HAS_PROJECT]->(teamProject:Project)
            WITH u, directProject, teamProject
            WITH u, 
                CASE 
                    WHEN ID(directProject) = toInteger($id) THEN directProject
                    WHEN ID(teamProject) = toInteger($id) THEN teamProject
                    ELSE null
                END AS p
            WHERE p IS NOT NULL
            SET p += $project
            RETURN p
`,
            { email: req.user?.email, id: req.params.id, project }
        );

        if (projectResult?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Project not found' });
        }

        const projectRecord = projectResult?.records.map(
            (record) => record.get('p').properties
        );

        return res
            .status(statusCodes.success)
            .json({ project: projectRecord[0].name });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while updating project' });
    }
};

export const deleteProject = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        await neo4jsession?.run(
            // only the owner of the project can delete it
            `MATCH (u:User {email: $email})-[:HAS_PROJECT {type: 'private'}]->(p:Project)
            WHERE ID(p) = toInteger($id)
            DETACH DELETE p`,
            { email: req.user?.email, id: req.params.id }
        );

        return res
            .status(statusCodes.success)
            .json({ message: 'Project deleted successfully' });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while deleting project' });
    }
};

export const createFolder = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(folderSchema, req, res);
        if (!result.success) {
            return result.response;
        }

        const folder = {
            ...result.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        let fieldString = '';
        Object.keys(folder).forEach((key) => {
            fieldString += `${key}: $${key}, `;
        });
        fieldString = fieldString.trim().slice(0, -1);

        const neo4jsession = getDriver()?.session();

        const folderResult = await neo4jsession?.run(
            `MATCH (u:User {email: $email})
            MERGE (f:Folder {${fieldString}})<-[:HAS_FOLDER]-(u)
            RETURN f`,
            { email: req.user?.email, ...folder }
        );

        const folderRecord = folderResult?.records.map(
            (record) => record.get('f').properties
        );

        return res
            .status(statusCodes.success)
            .json({ folder: folderRecord[0].name });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while creating folder' });
    }
};

export const getFolders = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        // const { page, limit } = req.query;
        // const resolvePage = parseInt(page as string, 10) ?? 1;
        // const resolveLimit = parseInt(limit as string, 10) ?? 10;
        // const skip = (resolvePage - 1) * resolveLimit;

        const neo4jsession = getDriver()?.session();
        const result = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:HAS_FOLDER]->(f:Folder)
            OPTIONAL MATCH (f)-[:STORES]->(p:Project)
            RETURN f AS folder, collect(p) AS projects
            `,
            { email: req.user?.email }
        );

        const folders = result?.records.map((record) => {
            return {
                folder: {
                    name: record.get('folder').properties.name,
                    id: record.get('folder').identity,
                }, // Assuming `name` is the folder's name property
                projects: record.get('projects').map((project: any) => ({
                    ...project.properties,
                    id: project.identity,
                })), // Get project properties
            };
        });

        return res.status(statusCodes.success).json({ folders });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while getting folders' });
    }
};

export const updateFolder = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(folderSchema, req, res);
        if (!result.success) {
            return result.response;
        }

        const folder = {
            ...result.data,
            updatedAt: new Date().toISOString(),
        };

        const neo4jsession = getDriver()?.session();
        const folderResult = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:HAS_FOLDER]->(f:Folder)
            WHERE ID(f) = toInteger($id)
            SET f += $folder
            RETURN f`,
            { email: req.user?.email, id: req.params.id, folder }
        );

        if (folderResult?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Folder not found' });
        }

        const folderRecord = folderResult?.records.map(
            (record) => record.get('f').properties
        );
        return res
            .status(statusCodes.success)
            .json({ folder: folderRecord[0].name });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while updating folder' });
    }
};

export const deleteFolder = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:HAS_FOLDER]->(f:Folder)
            WHERE ID(f) = toInteger($id)
            DETACH DELETE f`,
            { email: req.user?.email, id: req.params.id }
        );

        return res
            .status(statusCodes.success)
            .json({ message: 'Folder deleted successfully' });
    } catch (error) {
        logger.error(error);
        return res
            .status(statusCodes.serverError)
            .json({ message: 'An error occured while deleting folder' });
    }
};

export const addProjectToFolder = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        const result = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:HAS_FOLDER]->(f:Folder)
            WHERE ID(f) = toInteger($folderId)
            MATCH (p:Project)
            WHERE ID(p) = toInteger($projectId)
            MERGE (f)-[:STORES]->(p)
            RETURN f, p`,
            {
                email: req.user?.email,
                folderId: req.params.folderId,
                projectId: req.params.projectId,
            }
        );

        if (result?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Could not add project to folder' });
        }

        return res
            .status(statusCodes.success)
            .json({ message: 'Project added to folder' });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while adding project to folder',
        });
    }
};

export const removeProjectFromFolder = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { projectId, folderId } = req.params;
        const neo4jsession = getDriver()?.session();
        await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:HAS_FOLDER]->(f:Folder)
            WHERE ID(f) = toInteger($folderId)
            MATCH (f)-[s:STORES]->(p:Project)
            WHERE ID(p) = toInteger($projectId)
            DELETE s`,
            { email: req.user?.email, folderId, projectId }
        );

        return res
            .status(statusCodes.success)
            .json({ message: 'Project removed from folder' });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while removing project from folder',
        });
    }
};

export const getNoFolder = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        const result = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:HAS_PROJECT]->(p:Project)
            WHERE NOT (u)-[:HAS_FOLDER]->(:Folder)-[:STORES]->(p)
            RETURN p`,
            { email: req.user?.email }
        );

        const projects = result?.records.map((record) => {
            return {
                ...record.get('p').properties,
                id: record.get('p').identity,
            };
        });

        return res.status(statusCodes.success).json({ projects });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while getting projects without folder',
        });
    }
};

export const getFavorites = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        const result = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:FAVORITE]->(p:Project)
            MATCH (owner: User)-[:HAS_PROJECT]->(p)
            RETURN p, owner`,
            { email: req.user?.email }
        );

        const projects = result?.records.map((record) => {
            return {
                ...record.get('p').properties,
                id: record.get('p').identity,
                owner: record.get('owner').properties.email,
            };
        });
        return res.status(statusCodes.success).json({ projects });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while getting favorite projects',
        });
    }
};

export const addToFvorites = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();

        // create relationshipe favorite
        const result = await neo4jsession?.run(
            `
            MATCH (u:User {email: $email})
            MATCH (p:Project)
            WHERE ID(p) = toInteger($projectId)
            MERGE (u)-[:FAVORITE]->(p)
            RETURN p`,
            { email: req.user?.email, projectId: req.params.projectId }
        );

        if (result?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Could not add project to favorites' });
        }

        return res
            .status(statusCodes.success)
            .json({ message: 'Project added to favorites' });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while adding project to favorites',
        });
    }
};

export const removeFromFavorites = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();

        // create relationshipe favorite
        const result = await neo4jsession?.run(
            `
            MATCH (u:User {email: $email})
            MATCH (p:Project)
            WHERE ID(p) = toInteger($projectId)
            MATCH (u)-[f:FAVORITE]->(p)
            DELETE f
            RETURN p`,
            { email: req.user?.email, projectId: req.params.projectId }
        );

        if (result?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Could not remove project from favorites' });
        }

        return res
            .status(statusCodes.success)
            .json({ message: 'Project removed from favorites' });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while removing project from favorites',
        });
    }
};

export const getRecentProjects = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const recentQueue = await redisClient.LRANGE(
            `${req.user?.email}-recentProjects`,
            0,
            5
        );
        if (!recentQueue) {
            return res.status(statusCodes.success).json({ projects: [] });
        }
        // string to int
        const recentQueueInt = recentQueue.map((id) => parseInt(id, 10));

        const neo4jsession = getDriver()?.session();
        const result = await neo4jsession?.run(
            `MATCH (p:Project)
            WHERE ID(p) IN $recentQueueInt
            RETURN p`,
            { email: req.user?.email, recentQueueInt }
        );

        const projects = result?.records.map((record) => {
            return {
                ...record.get('p').properties,
                id: record.get('p').identity,
            };
        });

        return res.status(statusCodes.success).json({ projects });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while getting recent projects',
        });
    }
};

export const addToRecentProjects = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;
        // use redis queue to add to recent projects
        const recentQueue = await redisClient.LRANGE(
            `${req.user?.email}-recentProjects`,
            0,
            5
        );
        if (recentQueue) {
            if (recentQueue.length >= 5) {
                await redisClient.RPOP(`${req.user?.email}-recentProjects`);
            }
            if (recentQueue.includes(id)) {
                return res.status(statusCodes.success).json({
                    message: 'Project already in recent projects',
                });
            }
        }

        // check if project exists before adding to recent projects
        const neo4jsession = getDriver()?.session();
        const result = await neo4jsession?.run(
            `MATCH (p:Project)
            WHERE ID(p) = toInteger($id)
            RETURN p`,
            { email: req.user?.email, id }
        );

        if (result?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Project not found' });
        }

        await redisClient.LPUSH(`${req.user?.email}-recentProjects`, id);

        return res
            .status(statusCodes.success)
            .json({ message: 'Project added to recent projects' });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while adding project to recent projects',
        });
    }
};

export const saveClip = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { projectId } = req.params;
        const neo4jsession = getDriver()?.session();
        const { video_id, url, content_type } = req.body;
        if (!video_id || !url || !content_type) {
            return res
                .status(statusCodes.badRequest)
                .json({ message: 'Invalid clip' });
        }
        const clip = {
            videoId: video_id,
            src: url,
            contentType: content_type,
        };
        // add video_id, url to array of clips of the project where user is owner or member of team and is editor
        const result = await neo4jsession?.run(
            `MATCH (u:User {email: $email})
            MATCH (p:Project)
            WHERE ID(p) = toInteger($projectId)
            OPTIONAL MATCH (u)-[:MEMBER_OF {role: 'editor'}]->(t:Team)-[:HAS_PROJECT]->(p)
            WHERE
                (u)-[:HAS_PROJECT]->(p)
                OR t IS NOT NULL
            SET p.clips = coalesce(p.clips, []) + $clip
            RETURN p`,
            { email: req.user?.email, projectId, clip: JSON.stringify(clip) }
        );

        if (result?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Project not found' });
        }

        return res
            .status(statusCodes.success)
            .json({ message: 'Clip saved successfully' });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while saving clip',
        });
    }
};

export const updateProjectStatus = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { projectId } = req.params;
        const { status } = req.body;
        if (
            !Object.values(
                editProjectSchema.shape.status._def.innerType.Values
            ).includes(status as Status)
        ) {
            return res
                .status(statusCodes.badRequest)
                .json({ message: 'Invalid status' });
        }

        const neo4jsession = getDriver()?.session();

        // update project status of project where user is owner or member of team and is editor
        const result = await neo4jsession?.run(
            `MATCH (u:User {email: $email})
            MATCH (p:Project)
            WHERE ID(p) = toInteger($projectId)
            OPTIONAL MATCH (u)-[:MEMBER_OF {role: 'editor'}]->(t:Team)-[:HAS_PROJECT]->(p)
            WHERE
                (u)-[:HAS_PROJECT]->(p)
                OR t IS NOT NULL
            SET p.status = $status
            RETURN p`,
            { email: req.user?.email, projectId, status }
        );

        if (result?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Project not found' });
        }

        return res
            .status(statusCodes.success)
            .json({ message: 'Project status updated' });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while updating project status',
        });
    }
};

export const getProjectStatus = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { projectId } = req.params;
        const neo4jsession = getDriver()?.session();

        // get project status of project where user is owner or member
        const result = await neo4jsession?.run(
            `MATCH (u:User {email: $email})
            MATCH (p:Project)
            WHERE ID(p) = toInteger($projectId)
            OPTIONAL MATCH (u)-[:MEMBER_OF {role: 'editor'}]->(t:Team)-[:HAS_PROJECT]->(p)
            WHERE
                (u)-[:HAS_PROJECT]->(p)
                OR
                t IS NOT NULL
            RETURN p.status`,
            { email: req.user?.email, projectId }
        );

        if (result?.records.length === 0) {
            return res
                .status(statusCodes.notFound)
                .json({ message: 'Project not found' });
        }

        return res
            .status(statusCodes.success)
            .json({ status: result?.records[0].get('p.status') });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'An error occured while getting project status',
        });
    }
};
