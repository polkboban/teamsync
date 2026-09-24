import { Router } from 'express';
import { createTask, reorderTask } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

router.post('/', createTask);
router.patch('/:id/reorder', reorderTask); // Assuming you have a reorderTask function in your controller

export default router;