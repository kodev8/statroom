import { Router } from 'express';
import {
    createTeam,
    getTeams,
    getTeam,
    getTeamPublic,
    updateTeam,
    deleteTeam,
    getTeamProjects,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    getTeamMembers,
    getTeamMember,
    inviteMember,
    getTeamInvite,
    requsetTeamAccess,
    resolveTeamInvitation,
} from '~/controllers/team.controller';

const router = Router();

// team routes
router.post('', createTeam);
router.get('', getTeams);
router.get('/:id', getTeam);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.get('/:id/public', getTeamPublic);

// team project routes
router.get('/:id/projects', getTeamProjects);

// team members routes
router.post('/:id/invites', inviteMember); // send an invite to a user via email
router.get('/:id/invites', getTeamInvite); // send an invite to a user via email
router.post('/:id/invites/request-access', requsetTeamAccess); // send a request to join a team
router.post('/:id/invites/:token', resolveTeamInvitation); // accept or reject an invite

router.post('/:id/members', addTeamMember);
router.delete('/:id/members', removeTeamMember);
router.patch('/:id/members', updateTeamMemberRole);
router.get('/:id/members', getTeamMembers);

router.get('/:id/members/:email', getTeamMember); // check if a user is a member of a team

export default router;
