import { Router } from 'express';
import { createWorkspace, getUserWorkspaces } from '../controllers/workspaceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to ALL routes in this file
router.use(authenticate);

router.post('/', createWorkspace);
router.get('/', getUserWorkspaces);

export default router;