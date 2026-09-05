import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  listId: z.string().uuid('Invalid list ID'),
});

// 1. CREATE A TASK (CARD)
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const userId = req.userId!;

    // Security: Verify the list exists and the user has access to its workspace
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

    // Calculate the new order (put this task at the bottom of the list)
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