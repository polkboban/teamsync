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

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const reorderTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const assignTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: taskId } = req.params;
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