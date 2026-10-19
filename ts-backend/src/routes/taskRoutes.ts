import { Router } from 'express';
import {
  createTask,
  reorderTask,
  assignTask,
  updateTask,
  deleteTask,
  getTaskComments,
  createTaskComment,
  getTaskActivities,
  getTaskChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/reorder', reorderTask);
router.patch('/:id/assign', assignTask);
router.get('/:id/comments', getTaskComments);
router.post('/:id/comments', createTaskComment);
router.get('/:id/activities', getTaskActivities);
router.get('/:id/checklist', getTaskChecklist);
router.post('/:id/checklist', createChecklistItem);
router.patch('/:id/checklist/:itemId', updateChecklistItem);
router.delete('/:id/checklist/:itemId', deleteChecklistItem);

export default router;