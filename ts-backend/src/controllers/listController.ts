import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const createListSchema = z.object({
  title: z.string().min(1, 'List title is required'),
  boardId: z.string().uuid('Invalid board ID'),
});

// 1. CREATE A NEW LIST (COLUMN)
export const createList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createListSchema.parse(req.body);
    const userId = req.userId!;

    // Security: Check if the board exists and if the user is in its workspace
    const board = await prisma.board.findUnique({
      where: { id: validatedData.boardId },
      include: {
        workspace: {
          include: {
            members: { where: { userId: userId } },
          },
        },
      },
    });

    if (!board || board.workspace.members.length === 0) {
      res.status(403).json({ error: 'Access denied: You cannot modify this board' });
      return;
    }

    // Calculate the new order (put this list at the end of the board)
    const highestOrderList = await prisma.list.findFirst({
      where: { boardId: validatedData.boardId },
      orderBy: { order: 'desc' },
    });

    const newOrder = highestOrderList ? highestOrderList.order + 1000 : 1000; 
    // Note: We use increments of 1000 to make drag-and-drop math easier later!

    const list = await prisma.list.create({
      data: {
        title: validatedData.title,
        boardId: validatedData.boardId,
        order: newOrder,
      },
    });

    res.status(201).json({ message: 'List created successfully', list });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// 2. GET ALL LISTS FOR A BOARD (WITH TASKS)
export const getBoardLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const userId = req.userId!;

    // Security Check
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: { members: { where: { userId: userId } } },
        },
      },
    });

    if (!board || board.workspace.members.length === 0) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Fetch lists and order them correctly, including the tasks inside them
    const lists = await prisma.list.findMany({
      where: { boardId: boardId },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(200).json({ lists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};