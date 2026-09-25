import { Router } from 'express';
import { createWorkspace, getUserWorkspaces, createWorkspaceInvite, acceptWorkspaceInvite, getWorkspaceMembers } from '../controllers/workspaceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to ALL routes in this file
router.use(authenticate);

router.post('/invites/accept', acceptWorkspaceInvite);
router.post('/:id/invites', createWorkspaceInvite);

router.post('/', createWorkspace);
router.get('/', getUserWorkspaces);

router.get('/:id/members', getWorkspaceMembers);

export default router;