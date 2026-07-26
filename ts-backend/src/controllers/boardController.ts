import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation Schema
const createBoardSchema = z.object({
  title: z.string().min(1, 'Board title is required'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
});

// 1. CREATE A BOARD
export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createBoardSchema.parse(req.body);
    const userId = req.userId!;

    // Security Check: Is the user actually a member of this workspace?
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: validatedData.workspaceId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'Access denied: You are not a member of this workspace' });
      return;
    }

    // Create the Board
    const board = await prisma.board.create({
      data: {
        title: validatedData.title,
        workspaceId: validatedData.workspaceId,
      },
    });

    res.status(201).json({ message: 'Board created successfully', board });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// 2. GET BOARDS FOR A WORKSPACE
export const getWorkspaceBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId!;

    // Security Check: Is the user a member?
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'Access denied: You are not a member of this workspace' });
      return;
    }

    const boards = await prisma.board.findMany({
      where: { workspaceId: workspaceId },
      orderBy: { createdAt: 'desc' }, // Newest boards first
    });

    res.status(200).json({ boards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};