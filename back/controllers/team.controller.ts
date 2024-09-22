import { Request, Response } from 'express';
import { getDriver } from '~/database/neo4j_setup';
import { createTeamSchema, userProjectRolesSchema } from '#/types/schemas';
import statusCodes from '~/constants/statusCodes';
import inviteModel from '~/models/invite.model';
import { v4 as uuidv4 } from 'uuid';
import notificationModel from '~/models/notification.model';
import { parseZodBody } from '~/utils/zod.utils';
import { int } from 'neo4j-driver';
import sendMail from '~/mail/sendMail';
import logger from '~/middleware/winston';

export const createTeam = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(createTeamSchema, req, res);
        if (!result.success) {
            return result.response;
        }

        const { name, description } = result.data;

        const neo4jsession = getDriver()?.session();

        // check if a team with the same name exists
        const teamExists = await neo4jsession?.run(
            `MATCH (t:Team {name: $name}) RETURN t`,
            { name }
        );

        if (teamExists.records.length) {
            return res.status(statusCodes.badRequest).json({
                message: 'Team name is not available',
            });
        }

        const createdAt = new Date().toISOString();
        const teamRecord = await neo4jsession?.run(
            `MATCH (u:User {email: $email}) CREATE (
            t:Team {name: $name,
            description: $description,
            createdAt: $createdAt,
            updatedAt: $createdAt
            })<-[:MEMBER_OF {role: 'owner'}]-(u) RETURN t`,
            {
                email: req.user?.email,
                name,
                description,
                createdAt,
            }
        );

        const team = teamRecord.records[0]?.get('t');

        return res.status(statusCodes.success).json({
            id: team?.identity,
            // ...team.properties
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

const getAvailableTeams = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const neo4jsession = getDriver()?.session();

    // TOD: chcek user plan and limit team creation and project creation
    const myTeamRecords = await neo4jsession?.run(
        `MATCH (u:User {email: $email})-[:MEMBER_OF {role: 'owner'}]->(t:Team)
         OPTIONAL MATCH (t)-[:HAS_PROJECT]->(p:Project)
         WITH t, COUNT(p) AS projectCount
         WHERE projectCount < 2
         RETURN t, projectCount`,
        { email: req.user?.email }
    );

    const teams = myTeamRecords.records.map((record) => {
        return {
            ...record.get('t').properties,
            id: record.get('t').identity,
            projects: record.get('projectCount'),
            owner: req.user?.email,
        };
    });

    return res.status(statusCodes.success).json({
        teams,
    });
};

export const getTeams = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { available, name, limit } = req.query;

        if (available) {
            return getAvailableTeams(req, res);
        }

        let options = {};

        const neo4jsession = getDriver()?.session();
        let nameClause1 = '';
        let nameClause2 = '';
        if (name) {
            nameClause1 = `WHERE toLower(ownedTeam.name) CONTAINS toLower($name) `;
            nameClause2 = `AND toLower(memberTeam.name) CONTAINS toLower($name) `;
            options = { name };
        }

        let limitClause = '';
        if (limit) {
            limitClause = `[..$limit]`;
            const resolveLimit = parseInt(limit as string) ?? 4;
            options = { ...options, limit: int(resolveLimit) };
        }

        options = { ...options, email: req.user?.email };

        const teamRecords = await neo4jsession?.run(
            `
MATCH (user:User {email: $email})
// Owned teams
OPTIONAL MATCH (user)-[:MEMBER_OF {role: "owner"}]->(ownedTeam:Team)
${nameClause1}
OPTIONAL MATCH (ownedTeam)<-[:MEMBER_OF]-(member:User)
WHERE ownedTeam.name Is Not Null
WITH user, ownedTeam, count(member) AS ownedMemberCount
// Member teams
OPTIONAL MATCH (user)-[:MEMBER_OF]->(memberTeam:Team)
WHERE NOT (user)-[:MEMBER_OF {role: "owner"}]->(memberTeam)
${nameClause2}
OPTIONAL MATCH (memberTeam)<-[:MEMBER_OF {role: "owner"}]-(owner:User)
OPTIONAL MATCH (memberTeam)<-[:MEMBER_OF]-(member:User)
WITH DISTINCT
  user, 
  ownedTeam, 
  ownedMemberCount, 
  memberTeam, 
  count(member) AS memberMemberCount, 
  owner

// Collect data
WITH 
  [team in collect( DISTINCT {
    id: ID(ownedTeam),
    name: ownedTeam.name,
    owner: user.email,
    picture: ownedTeam.picture,
    description: ownedTeam.description,
    createdAt: ownedTeam.createdAt,
    members: ownedMemberCount
  }) where team.id is not null]${limitClause} AS ownedTeams,
  [team in collect( DISTINCT{
    id: ID(memberTeam),
    name: memberTeam.name,
    description: memberTeam.description,
    picture: memberTeam.picture,
    owner: owner.email,
    createdAt: memberTeam.createdAt,
    members: memberMemberCount
  }) where team.id is not null]${limitClause} AS memberTeams

RETURN ownedTeams, memberTeams

`,
            options
        );

        const myTeams = teamRecords.records[0].get('ownedTeams');
        const otherTeams = teamRecords.records[0].get('memberTeams');
        return res.status(statusCodes.success).json({
            otherTeams,
            myTeams,
        });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const getTeamPublic = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();

        const teamRecord = await neo4jsession?.run(
            `MATCH (t:Team)
WHERE ID(t) = toInteger($id)
OPTIONAL MATCH (owner:User)-[:MEMBER_OF {role: 'owner'}]->(t) // Owner of the team
RETURN t, owner
 `,
            { id: req.params.id }
        );

        if (!teamRecord || teamRecord.records.length === 0) {
            return res.status(statusCodes.notFound).json({
                message: 'Team not found',
            });
        }

        const team = teamRecord.records[0].get('t');
        const owner = teamRecord.records[0].get('owner');

        if (!team) {
            return res.status(statusCodes.notFound).json({
                message: 'Team not found',
            });
        }

        return res.status(statusCodes.success).json({
            id: team.identity,
            owner: owner?.properties?.email,
            ...team.properties,
        });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const getTeam = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();

        const teamRecord = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[rel:MEMBER_OF]->(t:Team)
WHERE ID(t) = toInteger($id)
OPTIONAL MATCH (t)-[:HAS_PROJECT]->(p:Project) // Projects of the team
OPTIONAL MATCH (member:User)-[mrel:MEMBER_OF]->(t) // Members of the team with their role
OPTIONAL MATCH (owner:User)-[:MEMBER_OF {role: 'owner'}]->(t) // Owner of the team
RETURN 
    t, 
    p,
    owner,
    COLLECT(DISTINCT { member: member, role: mrel.role }) AS members`,
            { email: req.user?.email, id: req.params.id }
        );

        if (!teamRecord || teamRecord.records.length === 0) {
            return res.status(statusCodes.notFound).json({
                message: 'Team not found',
            });
        }

        const team = teamRecord.records[0].get('t');
        const owner = teamRecord.records[0].get('owner');

        if (!team) {
            return res.status(statusCodes.notFound).json({
                message: 'Team not found',
            });
        }

        const projects = teamRecord.records
            .filter((record) => record.get('p'))
            .map((record) => ({
                id: record.get('p').identity,
                ...record.get('p').properties,
            }));

        const members = teamRecord.records[0].get('members')?.map(
            (member: {
                role: string;
                member: {
                    identity: number;
                    properties: Record<string, any>;
                };
            }) => ({
                id: member.member.identity,
                role: member.role,
                ...member.member.properties,
            })
        );

        return res.status(statusCodes.success).json({
            id: team.identity,
            owner: owner?.properties?.email,
            ...team.properties,
            // owner: ownerPublic.email,
            projects,
            members,
        });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const inviteMember = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { email } = req.body;

        if (!email || email === req.user?.email) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invalid email',
            });
        }

        const neo4jsession = getDriver()?.session();

        // check if the inviter is the owner of the team
        const teamRecord = await neo4jsession?.run(
            `MATCH (u:User {email: $owner})-[:MEMBER_OF {role: 'owner'}]->(t:Team)
        WHERE ID(t) = toInteger($id) RETURN t`,
            { id: req.params.id, owner: req.user?.email }
        );

        if (!teamRecord.records.length) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invalid team id',
            });
        }

        // check if the user is already a member of the team
        const memberRecord = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:MEMBER_OF]->(t:Team)
        WHERE ID(t) = toInteger($id) RETURN u`,
            { email, id: req.params.id }
        );

        if (memberRecord.records.length) {
            return res.status(statusCodes.badRequest).json({
                message: 'User is already a member of the team',
            });
        }

        const invite = new inviteModel({
            email,
            team: parseInt(req.params.id),
            sender: req.user?.email,
            recipient: email,
            token: uuidv4(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
        });

        await invite.save();

        // invite link is http://localhost:3000/teams/invite?token=${invite.token}

        const team = teamRecord.records[0].get('t').properties;
        const replace = {
            recipient: email,
            sender: req.user?.email,
            teamName: team.name,
            teamNameStrip: team.name.replace(/\s/g, ''),
            team_invite_url: `http://localhost:5173/teams/invites/${req.params.id}?token=${invite.token}`,
        };

        const attachments = [
            {
                filename: 'statroom-logo.png',
                path: './mail/templates/images/statroom-logo.png',
                cid: 'statroom-logo',
            },
            {
                filename: 'statroom-icon.png',
                path: './mail/templates/images/statroom-icon.png',
                cid: 'statroom-icon',
            },
        ];

        await sendMail(
            email,
            'Team Invite',
            replace,
            'invitation',
            attachments
        );
        return res.status(statusCodes.success).json({
            message: 'Invite sent',
        });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const updateTeam = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(createTeamSchema, req, res);
        if (!result.success) {
            return result.response;
        }
        const { name, description, picture } = result.data;
        let resolvePicture = picture;
        if (!picture) {
            resolvePicture = '';
        }
        const neo4jsession = getDriver()?.session();

        const teamRecord = await neo4jsession?.run(
            // only the team owner can update the team
            `MATCH (u:User {email: $email})-[:MEMBER_OF {role: 'owner'}]->(t:Team) WHERE ID(t) = toInteger($id)
            SET t.name = $name, t.description = $description, t.picture = $picture
            RETURN t`,
            {
                email: req.user?.email,
                id: req.params.id,
                name,
                description,
                picture: resolvePicture,
            }
        );

        const team = teamRecord?.records[0]?.get('t');
        if (!team) {
            return res.status(statusCodes.notFound).json({
                message: 'Unable to update team',
            });
        }

        return res.status(statusCodes.success).json({
            id: team.identity,
            ...team.properties,
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const deleteTeam = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;

        const neo4jsession = getDriver()?.session();

        await neo4jsession?.run(
            // deleting team will leave the project only attached to the owner so it is safe to detach delete the team
            `MATCH (u:User {email: $email})-[:MEMBER_OF {role: 'owner'}]->(t:Team) WHERE ID(t) = toInteger($id) DETACH DELETE t`,
            { email: req.user?.email, id }
        );

        return res.status(statusCodes.noContent).json();
    } catch {
        return res.status(statusCodes.badRequest).json({
            message: 'Invalid team id',
        });
    }
};

export const getTeamProjects = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const neo4jsession = getDriver()?.session();

    const teamRecord = await neo4jsession?.run(
        `MATCH (u:User {email: $email})-[:MEMBER_OF]->(t:Team)-[:HAS_PROJECT]->(p:Project)
        WHERE ID(t) = toInteger($id)
        RETURN p`,
        { email: req.user?.email, id: req.params.id }
    );

    const projects = teamRecord?.records.map((record) => {
        return {
            id: record.get('p').identity,
            ...record.get('p').properties,
        };
    });

    return res.status(statusCodes.success).json(projects);
};

export const addTeamMember = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const neo4jsession = getDriver()?.session();
    const { email, role } = req.body;

    const teamRecord = await neo4jsession?.run(
        `MATCH (u:User {email: $email})-[:MEMBER_OF]->(t:Team) WHERE ID(t) = toInteger($id) MERGE (u)-[:MEMBER_OF {role: $role}]->(t) RETURN u`,
        { email, id: req.params.id, role }
    );

    const user = teamRecord?.records[0].get('u');

    return res.status(statusCodes.success).json({
        id: user.identity,
        ...user.properties,
    });
};

export const removeTeamMember = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        const { email } = req.query;
        if (!email) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invalid request',
            });
        }

        const result = await neo4jsession?.run(
            `MATCH (owner:User {email: $owner})-[:MEMBER_OF {role: 'owner'}]->(t:Team)<-[rel:MEMBER_OF]-(u:User {email: $email})
            WHERE ID(t) = toInteger($id)
             DELETE rel`,
            { owner: req.user?.email, email, id: req.params.id }
        );

        if (!result.records.length) {
            return res.status(statusCodes.notFound).json({
                message: 'User not found',
            });
        }

        return res.status(statusCodes.noContent).json();
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const updateTeamMemberRole = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const result = parseZodBody(userProjectRolesSchema, req, res);
        if (!result.success) {
            return result.response;
        }
        const { email, role } = result.data;

        const neo4jsession = getDriver()?.session();

        const teamRecord = await neo4jsession?.run(
            `MATCH (owner:User {email: $owner})-[orel:MEMBER_OF {role: 'owner'}]->(t:Team)<-[mrel:MEMBER_OF]-(u:User {email: $email}) 
            WHERE ID(t) = toInteger($id) SET mrel.role = $role RETURN mrel`,
            { owner: req.user?.email, email, id: req.params.id, role }
        );

        if (!teamRecord.records.length) {
            return res.status(statusCodes.notFound).json({
                message: 'User not found',
            });
        }

        return res.status(statusCodes.success).json({
            message: 'Role updated',
        });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const getTeamMembers = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const neo4jsession = getDriver()?.session();

    const teamRecord = await neo4jsession?.run(
        `MATCH (u:User)-[:MEMBER_OF]->(t:Team) WHERE ID(t) = toInteger($id) RETURN u`,
        { id: req.params.id }
    );

    const users = teamRecord?.records.map((record) => {
        return {
            id: record.get('u').identity,
            ...record.get('u').properties,
        };
    });

    return res.status(statusCodes.success).json(users);
};

export const getTeamMember = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id: teamId, email: userEmail } = req.params;

        const neo4jsession = getDriver()?.session();

        const teamRecord = await neo4jsession?.run(
            `MATCH (u:User {email: $email})-[:MEMBER_OF]->(t:Team) WHERE ID(t) = toInteger($id) RETURN u`,
            { email: userEmail, id: teamId }
        );

        const user = teamRecord?.records[0]?.get('u');

        return res.status(statusCodes.success).json({
            isMember: user,
        });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const getTeamInvite = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id: teamId } = req.params;
        const { token } = req.query;
        if (!token) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invalid request',
            });
        }

        const invite = await inviteModel.findOne({
            team: teamId,
            recipient: req.user?.email,
            token,
        });

        if (!invite) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invalid invite',
            });
        }

        if (invite.expires < new Date()) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invite expired',
            });
        }

        return res.status(statusCodes.success).json({
            message: 'Invite valid',
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const resolveTeamInvitation = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id: teamId, token } = req.params;
        const { resolution } = req.body;

        const invite = await inviteModel.findOne({
            team: teamId,
            recipient: req.user?.email,
            token,
            resolution: null,
        });

        if (!invite) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invalid invite',
            });
        }

        if (invite.expires < new Date()) {
            return res.status(statusCodes.badRequest).json({
                message: 'Invite expired',
            });
        }

        if (resolution === 'accept') {
            const neo4jsession = getDriver()?.session();

            const teamRecord = await neo4jsession?.run(
                `MATCH (u:User {email: $email})-[:MEMBER_OF]->(t:Team) WHERE ID(t) = toInteger($id) RETURN u`,
                { email: req.user?.email, id: teamId }
            );

            if (teamRecord?.records.length) {
                return res.status(statusCodes.badRequest).json({
                    message: 'User is already a member of the team',
                });
            }

            await neo4jsession?.run(
                `MATCH (u:User {email: $email}), (t:Team) WHERE ID(t) = toInteger($id) MERGE (u)-[:MEMBER_OF {role: 'viewer'}]->(t)`,
                { email: req.user?.email, id: teamId }
            );

            const notification = new notificationModel({
                sender: req.user?.email,
                recipient: invite.sender,
                type: 'team_access_response',
                title: `Team Access Response`,
                message: `${req.user?.email} has accepted your team invite`,
                seen: false,
                category: 'team',
                subcategory: 'info',
                data: {
                    teamId,
                },
            });

            await notification.save();
        }

        await invite.updateOne({ resolution });

        return res.status(statusCodes.success).json({
            message: 'Invite resolved',
        });
    } catch (_error) {
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};

export const requsetTeamAccess = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const neo4jsession = getDriver()?.session();
        const { id } = req.params;

        // find the team leader to send them a notif
        const teamRecord = await neo4jsession?.run(
            `MATCH (u:User)-[:MEMBER_OF {role: 'owner'}]->(t:Team) WHERE ID(t) = toInteger($id) RETURN u, t`,
            { id }
        );

        const teamLeader = teamRecord?.records[0]?.get('u');

        const notification = new notificationModel({
            sender: req.user?.email,
            recipient: teamLeader?.properties?.email,
            type: 'team_access_request',
            title: `Team Access Request`,
            message: `${req.user?.email} has requested to join your team`,
            seen: false,
            category: 'team',
            subcategory: 'info',
            data: {
                teamId: id,
            },
        });
        await notification.save();

        return res.status(statusCodes.success).json({
            message: 'Request sent',
        });
    } catch (error) {
        logger.error(error);
        return res.status(statusCodes.serverError).json({
            message: 'Internal server error',
        });
    }
};
