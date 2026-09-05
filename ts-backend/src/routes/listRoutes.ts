import { Router } from 'express';
import { createList, getBoardLists } from '../controllers/listController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

router.post('/', createList);
router.get('/board/:boardId', getBoardLists);

export default router;