import { Router } from 'express';
import { createTask, reorderTask, assignTask } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

router.post('/', createTask);
router.patch('/:id/reorder', reorderTask);
router.patch('/:id/assign', assignTask);

export default router;