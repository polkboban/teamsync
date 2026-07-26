import { Router } from 'express';
import { createBoard, getWorkspaceBoards } from '../controllers/boardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

router.post('/', createBoard);
router.get('/workspace/:workspaceId', getWorkspaceBoards);

export default router;