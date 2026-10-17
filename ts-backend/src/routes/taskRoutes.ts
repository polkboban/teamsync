import { Router } from 'express';
import { createTask, reorderTask, assignTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/reorder', reorderTask);
router.patch('/:id/assign', assignTask);

export default router;