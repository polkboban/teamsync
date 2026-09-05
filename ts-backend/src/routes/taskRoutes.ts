import { Router } from 'express';
import { createTask } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

router.post('/', createTask);

export default router;