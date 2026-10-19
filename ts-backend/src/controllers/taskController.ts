import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { getSocket } from '../socket';

const prisma = new PrismaClient();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  listId: z.string().uuid('Invalid list ID'),
});

const reorderTaskSchema = z.object({
  listId: z.string().uuid('Invalid list ID'),
  order: z.number(),
});

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const userId = req.userId!;

    const list = await prisma.list.findUnique({
      where: { id: validatedData.listId },
      include: {
        board: {
          include: {
            workspace: {
              include: {
                members: { where: { userId: userId } },
              },
            },
          },
        },
      },
    });

    if (!list || list.board.workspace.members.length === 0) {
      res.status(403).json({ error: 'Access denied: You cannot add tasks here' });
      return;
    }

    const highestOrderTask = await prisma.task.findFirst({
      where: { listId: validatedData.listId },
      orderBy: { order: 'desc' },
    });

    const newOrder = highestOrderTask ? highestOrderTask.order + 1000 : 1000;

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        listId: validatedData.listId,
        order: newOrder,
      },
    });

    try {
      await prisma.taskActivity.create({
        data: {
          taskId: task.id,
          userId,
          action: 'created this task',
        },
      });
    } catch (e) {
      console.warn('Failed to record task activity:', e);
    }

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: (error as any).issues || (error as any).errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const reorderTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = reorderTaskSchema.parse(req.body);
    const userId = req.userId!;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            board: {
              include: { workspace: { include: { members: { where: { userId } } } } }
            }
          }
        }
      }
    });

    if (!task || task.list.board.workspace.members.length === 0) {
      res.status(403).json({ error: 'Access denied: Cannot modify this task' });
      return;
    }

    if (task.listId !== validatedData.listId) {
      const destinationList = await prisma.list.findUnique({
        where: { id: validatedData.listId },
        include: {
          board: {
            include: { workspace: { include: { members: { where: { userId } } } } }
          }
        }
      });

      if (!destinationList || destinationList.board.workspace.members.length === 0) {
        res.status(403).json({ error: 'Access denied: Cannot move to this destination' });
        return;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        listId: validatedData.listId,
        order: validatedData.order,
      },
    });
    const boardId = task.list.board.id;
    getSocket().to(`board:${boardId}`).emit('task:reordered', {
      taskId: updatedTask.id,
      listId: updatedTask.listId,
      order: updatedTask.order,
    });
    res.status(200).json({ message: 'Task reordered successfully', task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: (error as any).issues || (error as any).errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const assignTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id as string;
    const { assigneeId } = req.body; // User ID being assigned
    const actorId = req.userId!;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
      include: {
        list: {
          include: { board: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const io = getSocket();
    const boardId = updatedTask.list.board.id;

    // 1. Broadcast to the board room
    io.to(`board:${boardId}`).emit('task-updated', {
      taskId: updatedTask.id,
      assignee: updatedTask.assignee,
    });

    try {
      await prisma.taskActivity.create({
        data: {
          taskId: updatedTask.id,
          userId: actorId,
          action: assigneeId && updatedTask.assignee
            ? `assigned to ${updatedTask.assignee.name}`
            : 'unassigned this task',
        },
      });
    } catch (e) {
      console.warn('Failed to record assignment activity:', e);
    }

    // 2. Push direct notification to assignee (if assigned to someone else)
    if (assigneeId && assigneeId !== actorId) {
      io.to(`user:${assigneeId}`).emit('notification:new', {
        type: 'TASK_ASSIGNED',
        title: 'New Task Assignment',
        message: `You were assigned to "${updatedTask.title}"`,
        taskId: updatedTask.id,
        boardId,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(200).json({ task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description } = req.body;
    const userId = req.userId!;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        list: {
          include: { board: { include: { workspace: { include: { members: { where: { userId } } } } } } }
        }
      }
    });

    if (!task || task.list.board.workspace.members.length === 0) {
      res.status(403).json({ error: 'Access denied: Cannot edit this task' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      }
    });

    const boardId = task.list.board.id;
    getSocket().to(`board:${boardId}`).emit('task:updated', { task: updatedTask });

    try {
      if (title && title !== task.title) {
        await prisma.taskActivity.create({
          data: {
            taskId: id,
            userId,
            action: `renamed task to "${title}"`,
          },
        });
      } else if (description !== undefined && description !== task.description) {
        await prisma.taskActivity.create({
          data: {
            taskId: id,
            userId,
            action: 'updated task description',
          },
        });
      }
    } catch (e) {
      console.warn('Failed to record update activity:', e);
    }

    res.status(200).json({ task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        list: {
          include: { board: { include: { workspace: { include: { members: { where: { userId } } } } } } }
        }
      }
    });

    if (!task || task.list.board.workspace.members.length === 0) {
      res.status(403).json({ error: 'Access denied: Cannot delete this task' });
      return;
    }

    const boardId = task.list.board.id;
    await prisma.task.delete({ where: { id } });

    getSocket().to(`board:${boardId}`).emit('task:deleted', { taskId: id });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const comments = await prisma.comment.findMany({
      where: { taskId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTaskComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { content } = req.body;
    const userId = req.userId!;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Comment content cannot be empty' });
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        list: { include: { board: true } },
        assignee: true,
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId: id,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Record activity
    let activity = null;
    try {
      activity = await prisma.taskActivity.create({
        data: {
          taskId: id,
          userId,
          action: 'commented',
          details: content.trim().slice(0, 80),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (e) {
      console.warn('Failed to record comment activity:', e);
    }

    const boardId = task.list.board.id;
    const io = getSocket();

    // Broadcast to board room
    io.to(`board:${boardId}`).emit('task:comment-added', {
      taskId: id,
      comment,
      activity,
    });

    // Notification to assignee
    if (task.assigneeId && task.assigneeId !== userId) {
      io.to(`user:${task.assigneeId}`).emit('notification:new', {
        type: 'TASK_COMMENT',
        title: 'New Comment on Task',
        message: `${comment.user.name} commented on "${task.title}"`,
        taskId: task.id,
        boardId,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ comment, activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const activities = await prisma.taskActivity.findMany({
      where: { taskId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });
    res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskChecklist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const checklist = await prisma.checklistItem.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json({ checklist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChecklistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title } = req.body;
    const userId = req.userId!;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Checklist item title is required' });
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const item = await prisma.checklistItem.create({
      data: {
        title: title.trim(),
        taskId: id,
      },
    });

    try {
      await prisma.taskActivity.create({
        data: {
          taskId: id,
          userId,
          action: `added checklist item: "${title.trim()}"`,
        },
      });
    } catch (e) {
      console.warn('Failed to record activity', e);
    }

    const boardId = task.list.board.id;
    getSocket().to(`board:${boardId}`).emit('task:checklist-updated', { taskId: id });

    res.status(201).json({ item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateChecklistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const itemId = req.params.itemId as string;
    const { title, isDone } = req.body;
    const userId = req.userId!;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(title !== undefined && { title }),
        ...(isDone !== undefined && { isDone }),
      },
    });

    try {
      if (isDone !== undefined) {
        await prisma.taskActivity.create({
          data: {
            taskId: id,
            userId,
            action: isDone ? `completed "${updatedItem.title}"` : `marked "${updatedItem.title}" incomplete`,
          },
        });
      }
    } catch (e) {
      console.warn('Failed to record activity', e);
    }

    const boardId = task.list.board.id;
    getSocket().to(`board:${boardId}`).emit('task:checklist-updated', { taskId: id });

    res.status(200).json({ item: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteChecklistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const itemId = req.params.itemId as string;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.checklistItem.delete({ where: { id: itemId } });

    const boardId = task.list.board.id;
    getSocket().to(`board:${boardId}`).emit('task:checklist-updated', { taskId: id });

    res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};